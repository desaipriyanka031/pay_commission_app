import { PayRule, PayMatrixCell, CalculationStep, PayFixationResult } from '../types';
import { payCommissionService } from './PayCommissionService';
import { AppError } from '../middleware/errorHandler';

/**
 * PayRuleEngine
 * -----------------------------------------------------------------------
 * Commission-agnostic calculation engine.
 * All calculation logic is driven by rules stored in the database.
 * New pay commissions are supported by configuring their rules in the DB.
 *
 * IMPORTANT: Rule parameters come from pay_rules.rule_parameters (JSON).
 * This means calculation behaviour can be changed via configuration
 * without modifying this code.
 * -----------------------------------------------------------------------
 */
export class PayRuleEngine {

  // -----------------------------------------------------------------------
  // INCREMENT CALCULATION
  // -----------------------------------------------------------------------
  /**
   * Calculate increment: move to the next cell in the same pay level.
   * The pay matrix determines the next cell value.
   */
  async calculateIncrement(input: {
    commissionId: number;
    payLevelId: number;
    currentPayCell: number;
    currentBasicPay: number;
    incrementDate: Date;
    calculatedBy: number;
  }): Promise<{
    newPayCell: number;
    newBasicPay: number;
    nextIncrementDate: Date;
    steps: CalculationStep[];
    ruleUsed: PayRule | null;
  }> {
    const steps: CalculationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: 'Current Pay Details',
      inputValue: input.currentBasicPay,
      notes: `Pay Level ID: ${input.payLevelId}, Cell: ${input.currentPayCell}`,
    });

    // Get increment rule for this commission
    const rules = await payCommissionService.getActiveRules(input.commissionId, 'INCREMENT_RULE');
    const rule = rules[0] || null;

    steps.push({
      stepNumber: 2,
      description: 'Applicable Increment Rule',
      notes: rule ? `Rule: ${rule.ruleName}` : 'PLACEHOLDER: No increment rule configured. Please configure rules from official documents.',
    });

    // Find next cell in pay matrix (next cell above current pay)
    const nextCell = await payCommissionService.findNextCell(
      input.payLevelId,
      input.currentBasicPay
    );

    if (!nextCell) {
      throw new AppError(
        'No next pay cell found. Employee may be at the maximum of this pay level.',
        400
      );
    }

    steps.push({
      stepNumber: 3,
      description: 'Next Cell from Pay Matrix',
      inputValue: input.currentBasicPay,
      outputValue: nextCell.basicPay,
      ruleApplied: rule?.ruleName,
      notes: `Cell ${input.currentPayCell} → Cell ${nextCell.cellNumber}: ₹${input.currentBasicPay} → ₹${nextCell.basicPay}`,
    });

    // Calculate next increment date (typically 1 year from increment date)
    const params = rule?.ruleParameters as Record<string, unknown> | undefined;
    const incrementPeriodMonths = (params?.incrementPeriodMonths as number) ?? 12;
    const nextIncrementDate = new Date(input.incrementDate);
    nextIncrementDate.setMonth(nextIncrementDate.getMonth() + incrementPeriodMonths);

    steps.push({
      stepNumber: 4,
      description: 'Next Increment Date',
      outputValue: nextIncrementDate.toISOString().split('T')[0],
      notes: `${incrementPeriodMonths} months from increment date`,
    });

    return {
      newPayCell: nextCell.cellNumber,
      newBasicPay: nextCell.basicPay,
      nextIncrementDate,
      steps,
      ruleUsed: rule,
    };
  }

  // -----------------------------------------------------------------------
  // PROMOTION PAY FIXATION
  // -----------------------------------------------------------------------
  /**
   * Calculate pay on promotion.
   * Standard approach: Notional increment in old level, then fixation in new level.
   * Exact rules must be configured per commission; this implements the generic flow.
   */
  async calculatePromotionPay(input: {
    commissionId: number;
    currentPayLevelId: number;
    currentPayCell: number;
    currentBasicPay: number;
    newPayLevelId: number;
    promotionDate: Date;
    calculatedBy: number;
    ruleId?: number;
  }): Promise<{
    newPayCell: number;
    newBasicPay: number;
    nextIncrementDate: Date;
    steps: CalculationStep[];
    ruleUsed: PayRule | null;
  }> {
    const steps: CalculationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: 'Current Pay Before Promotion',
      inputValue: input.currentBasicPay,
      notes: `Pay Level ID: ${input.currentPayLevelId}, Cell: ${input.currentPayCell}`,
    });

    // Get promotion rule
    let rule: PayRule | null = null;
    if (input.ruleId) {
      rule = await payCommissionService.getRuleById(input.ruleId);
    } else {
      const rules = await payCommissionService.getActiveRules(input.commissionId, 'PROMOTION_RULE');
      rule = rules[0] || null;
    }

    steps.push({
      stepNumber: 2,
      description: 'Applicable Promotion Rule',
      notes: rule
        ? `Rule: ${rule.ruleName} - ${rule.ruleDescription || ''}`
        : 'PLACEHOLDER: No promotion rule configured. Configure rules from official commission documents.',
    });

    const params = rule?.ruleParameters as Record<string, unknown> | undefined;

    // Step 1: Give notional increment in current level
    const notionalIncrement = params?.applyNotionalIncrement !== false;
    let payForFixation = input.currentBasicPay;

    if (notionalIncrement) {
      const nextCellInOldLevel = await payCommissionService.findNextCell(
        input.currentPayLevelId,
        input.currentBasicPay
      );
      if (nextCellInOldLevel) {
        payForFixation = nextCellInOldLevel.basicPay;
        steps.push({
          stepNumber: 3,
          description: 'Notional Increment in Existing Level',
          inputValue: input.currentBasicPay,
          outputValue: payForFixation,
          ruleApplied: rule?.ruleName,
          notes: `One notional increment applied in Level ${input.currentPayLevelId}`,
        });
      }
    } else {
      steps.push({
        stepNumber: 3,
        description: 'Notional Increment',
        notes: 'Notional increment not applicable per configured rule.',
      });
    }

    // Step 2: Fix pay in new level (find cell equal to or above notional incremented pay)
    const cellInNewLevel = await payCommissionService.findCellEqualOrAbove(
      input.newPayLevelId,
      payForFixation
    );

    if (!cellInNewLevel) {
      throw new AppError(
        'No suitable cell found in the new pay level for promotion fixation.',
        400
      );
    }

    steps.push({
      stepNumber: 4,
      description: 'Fixation in New Pay Level',
      inputValue: payForFixation,
      outputValue: cellInNewLevel.basicPay,
      ruleApplied: rule?.ruleName,
      notes: `New Level ID ${input.newPayLevelId}, Cell ${cellInNewLevel.cellNumber}: ₹${cellInNewLevel.basicPay}`,
    });

    // Next increment date after promotion
    const incrementPeriodMonths = (params?.incrementPeriodMonths as number) ?? 12;
    const nextIncrementDate = new Date(input.promotionDate);
    nextIncrementDate.setMonth(nextIncrementDate.getMonth() + incrementPeriodMonths);

    steps.push({
      stepNumber: 5,
      description: 'Next Increment Date After Promotion',
      outputValue: nextIncrementDate.toISOString().split('T')[0],
      notes: `${incrementPeriodMonths} months from promotion date per configured rule`,
    });

    return {
      newPayCell: cellInNewLevel.cellNumber,
      newBasicPay: cellInNewLevel.basicPay,
      nextIncrementDate,
      steps,
      ruleUsed: rule,
    };
  }

  // -----------------------------------------------------------------------
  // SELECTION GRADE PAY FIXATION
  // -----------------------------------------------------------------------
  async calculateSelectionGradePay(input: {
    commissionId: number;
    currentPayLevelId: number;
    currentPayCell: number;
    currentBasicPay: number;
    newPayLevelId: number;
    effectiveDate: Date;
    gradeType: string;
    calculatedBy: number;
    ruleId?: number;
  }): Promise<{
    newPayCell: number;
    newBasicPay: number;
    nextIncrementDate: Date;
    steps: CalculationStep[];
    ruleUsed: PayRule | null;
  }> {
    const steps: CalculationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `${input.gradeType} - Current Pay`,
      inputValue: input.currentBasicPay,
      notes: `Pay Level ID: ${input.currentPayLevelId}, Cell: ${input.currentPayCell}`,
    });

    let rule: PayRule | null = null;
    if (input.ruleId) {
      rule = await payCommissionService.getRuleById(input.ruleId);
    } else {
      const rules = await payCommissionService.getActiveRules(input.commissionId, 'SELECTION_GRADE_RULE');
      rule = rules[0] || null;
    }

    steps.push({
      stepNumber: 2,
      description: 'Applicable Selection Grade Rule',
      notes: rule
        ? `Rule: ${rule.ruleName}`
        : 'PLACEHOLDER: No selection grade rule configured.',
    });

    // Fix in new level (cell equal to or above current pay)
    const cellInNewLevel = await payCommissionService.findCellEqualOrAbove(
      input.newPayLevelId,
      input.currentBasicPay
    );

    if (!cellInNewLevel) {
      throw new AppError('No suitable cell in new pay level for selection grade fixation.', 400);
    }

    steps.push({
      stepNumber: 3,
      description: 'Fixation in New Pay Level',
      inputValue: input.currentBasicPay,
      outputValue: cellInNewLevel.basicPay,
      notes: `New Level ID ${input.newPayLevelId}, Cell ${cellInNewLevel.cellNumber}`,
    });

    const params = rule?.ruleParameters as Record<string, unknown> | undefined;
    const incrementPeriodMonths = (params?.incrementPeriodMonths as number) ?? 12;
    const nextIncrementDate = new Date(input.effectiveDate);
    nextIncrementDate.setMonth(nextIncrementDate.getMonth() + incrementPeriodMonths);

    steps.push({
      stepNumber: 4,
      description: 'Next Increment Date',
      outputValue: nextIncrementDate.toISOString().split('T')[0],
    });

    return {
      newPayCell: cellInNewLevel.cellNumber,
      newBasicPay: cellInNewLevel.basicPay,
      nextIncrementDate,
      steps,
      ruleUsed: rule,
    };
  }

  // -----------------------------------------------------------------------
  // PAY REVISION (Commission Change)
  // -----------------------------------------------------------------------
  /**
   * Calculate pay revision when switching from one commission to another.
   * Uses fitment factor and revision rules configured for the target commission.
   */
  async calculateRevisionPay(input: {
    fromCommissionId: number;
    toCommissionId: number;
    currentBasicPay: number;
    currentPayLevelId: number;
    currentPayCell: number;
    effectiveDate: Date;
    calculatedBy: number;
    ruleId?: number;
  }): Promise<{
    newPayLevelId: number;
    newPayCell: number;
    newBasicPay: number;
    fitmentFactorUsed: number;
    steps: CalculationStep[];
    ruleUsed: PayRule | null;
  }> {
    const steps: CalculationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: 'Current Pay (Pre-revision)',
      inputValue: input.currentBasicPay,
    });

    // Get revision rule for target commission
    let rule: PayRule | null = null;
    if (input.ruleId) {
      rule = await payCommissionService.getRuleById(input.ruleId);
    } else {
      const rules = await payCommissionService.getActiveRules(input.toCommissionId, 'REVISION_RULE');
      rule = rules[0] || null;
    }

    const toCommission = await payCommissionService.getCommissionById(input.toCommissionId);
    const fitmentFactor = (rule?.ruleParameters as Record<string, unknown> | undefined)?.fitmentFactor as number
      ?? toCommission.fitmentFactor
      ?? 1;

    steps.push({
      stepNumber: 2,
      description: 'Fitment Factor',
      inputValue: fitmentFactor,
      notes: rule ? `From rule: ${rule.ruleName}` : 'From commission configuration',
    });

    // Apply fitment factor
    const provisionalPay = Math.round(input.currentBasicPay * fitmentFactor);

    steps.push({
      stepNumber: 3,
      description: 'Provisional Pay (Fitment Applied)',
      inputValue: input.currentBasicPay,
      outputValue: provisionalPay,
      ruleApplied: rule?.ruleName,
      notes: `₹${input.currentBasicPay} × ${fitmentFactor} = ₹${provisionalPay}`,
    });

    // Find the equivalent level in new commission (same level number)
    const oldLevels = await payCommissionService.getPayLevels(input.fromCommissionId);
    const oldLevel = oldLevels.find(l => l.payLevelId === input.currentPayLevelId);

    const newLevels = await payCommissionService.getPayLevels(input.toCommissionId);
    const correspondingLevel = newLevels.find(l => l.levelNumber === oldLevel?.levelNumber);

    if (!correspondingLevel) {
      throw new AppError(
        'No corresponding pay level found in target commission. Please configure pay levels.',
        400
      );
    }

    steps.push({
      stepNumber: 4,
      description: 'Corresponding Level in New Commission',
      notes: `Level ${correspondingLevel.levelNumber} (ID: ${correspondingLevel.payLevelId})`,
    });

    // Find cell equal to or above provisional pay
    const cellInNewLevel = await payCommissionService.findCellEqualOrAbove(
      correspondingLevel.payLevelId,
      provisionalPay
    );

    if (!cellInNewLevel) {
      throw new AppError('No suitable cell in new pay matrix.', 400);
    }

    steps.push({
      stepNumber: 5,
      description: 'Revised Pay Fixed in New Matrix',
      inputValue: provisionalPay,
      outputValue: cellInNewLevel.basicPay,
      notes: `Level ${correspondingLevel.levelNumber}, Cell ${cellInNewLevel.cellNumber}: ₹${cellInNewLevel.basicPay}`,
    });

    return {
      newPayLevelId: correspondingLevel.payLevelId,
      newPayCell: cellInNewLevel.cellNumber,
      newBasicPay: cellInNewLevel.basicPay,
      fitmentFactorUsed: fitmentFactor,
      steps,
      ruleUsed: rule,
    };
  }

  // -----------------------------------------------------------------------
  // ARREARS CALCULATION
  // -----------------------------------------------------------------------
  calculateArrears(input: {
    fromDate: Date;
    toDate: Date;
    oldBasicPay: number;
    revisedBasicPay: number;
  }): {
    monthlyDetails: Array<{ month: string; oldPay: number; revisedPay: number; difference: number; arrear: number }>;
    totalArrear: number;
  } {
    const monthlyDetails = [];
    const current = new Date(input.fromDate);
    let totalArrear = 0;

    while (current <= input.toDate) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;

      const difference = input.revisedBasicPay - input.oldBasicPay;
      totalArrear += difference;

      monthlyDetails.push({
        month: monthStr,
        oldPay: input.oldBasicPay,
        revisedPay: input.revisedBasicPay,
        difference,
        arrear: difference,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return { monthlyDetails, totalArrear };
  }
}

export const payRuleEngine = new PayRuleEngine();
