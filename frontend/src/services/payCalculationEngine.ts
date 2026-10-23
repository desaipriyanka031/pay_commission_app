import { CalculationStep, CityCategory, ArrearsMonthBreakdown } from '../types';

export interface CalculationResult {
  previousBasicPay: number;
  previousLevel: string;
  previousCell: number;
  newBasicPay: number;
  newLevel: string;
  newCell: number;
  calculationSteps: CalculationStep[];
  nextIncrementDate: string;
  daAmount: number;
  hraAmount: number;
  taAmount: number;
  grossPay: number;
}

export class PayCalculationEngine {
  /**
   * Calculate standard Annual Increment (advance by 1 vertical cell in same level)
   */
  static calculateAnnualIncrement(
    levelNumber: string,
    currentCellNumber: number,
    matrix: Record<string, { cellNumber: number; basicPay: number }[]>,
    cityCategory: CityCategory = 'X'
  ): CalculationResult {
    const cells = matrix[levelNumber] || [];
    const currentCell = cells.find(c => c.cellNumber === currentCellNumber) || cells[0];
    const nextCell = cells.find(c => c.cellNumber === currentCellNumber + 1) || currentCell;

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        title: 'Current Pay Baseline Verification',
        description: `Existing substantive Basic Pay verified in Level ${levelNumber}, Cell ${currentCellNumber}.`,
        formula: `Level ${levelNumber}, Cell ${currentCellNumber}`,
        inputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`,
        outputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`
      },
      {
        stepNumber: 2,
        title: 'Eligibility & Uniform Increment Rule Check',
        description: 'Qualifying service of minimum 6 months rendered in the current stage.',
        formula: 'Annual Cycle: 3% compounding represented by 1 vertical cell step',
        notes: 'Rule: Advance by 1 stage vertically in the same level'
      },
      {
        stepNumber: 3,
        title: 'Progression to Next Vertical Cell',
        description: `Progress from Cell ${currentCellNumber} (₹${currentCell.basicPay.toLocaleString('en-IN')}) to Cell ${nextCell.cellNumber} (₹${nextCell.basicPay.toLocaleString('en-IN')}) in Level ${levelNumber}.`,
        formula: `Cell ${currentCellNumber} -> Cell ${nextCell.cellNumber}`,
        inputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`,
        outputValue: `₹${nextCell.basicPay.toLocaleString('en-IN')}`
      }
    ];

    const allowances = this.calculateAllowances(nextCell.basicPay, levelNumber, cityCategory);

    return {
      previousBasicPay: currentCell.basicPay,
      previousLevel: levelNumber,
      previousCell: currentCellNumber,
      newBasicPay: nextCell.basicPay,
      newLevel: levelNumber,
      newCell: nextCell.cellNumber,
      calculationSteps: steps,
      nextIncrementDate: '01-07-2027',
      ...allowances
    };
  }

  /**
   * Calculate Promotional Pay Fixation under FR 22(I)(a)(1)
   */
  static calculatePromotion(
    currentLevel: string,
    currentCellNumber: number,
    promotionalLevel: string,
    matrix: Record<string, { cellNumber: number; basicPay: number }[]>,
    cityCategory: CityCategory = 'X'
  ): CalculationResult {
    const currentLevelCells = matrix[currentLevel] || [];
    const promoLevelCells = matrix[promotionalLevel] || [];

    const currentCell = currentLevelCells.find(c => c.cellNumber === currentCellNumber) || currentLevelCells[0];
    const notionalCell = currentLevelCells.find(c => c.cellNumber === currentCellNumber + 1) || currentCell;
    const notionalPay = notionalCell.basicPay;

    // In promotional level, search for cell with equal basic pay or next higher
    let matchedPromoCell = promoLevelCells.find(c => c.basicPay === notionalPay);
    let matchType = 'Exact Match';

    if (!matchedPromoCell) {
      matchedPromoCell = promoLevelCells.find(c => c.basicPay > notionalPay);
      matchType = 'Next Higher Cell';
    }

    // Fallback if beyond max cell
    if (!matchedPromoCell && promoLevelCells.length > 0) {
      matchedPromoCell = promoLevelCells[promoLevelCells.length - 1];
      matchType = 'Capped at Maximum Cell';
    }

    const targetPromoCell = matchedPromoCell || { cellNumber: 1, basicPay: notionalPay };

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        title: 'Current Pay Baseline in Substantive Feeder Post',
        description: `Existing Basic Pay in feeder Level ${currentLevel}, Cell ${currentCellNumber}.`,
        formula: `Level ${currentLevel}, Cell ${currentCellNumber}`,
        inputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`,
        outputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`
      },
      {
        stepNumber: 2,
        title: 'Grant of Notional Increment in Feeder Level',
        description: `Under FR 22(I)(a)(1), grant one notional vertical increment in Level ${currentLevel} to advance from Cell ${currentCellNumber} to Cell ${notionalCell.cellNumber}.`,
        formula: `₹${currentCell.basicPay.toLocaleString('en-IN')} + 1 Cell = ₹${notionalPay.toLocaleString('en-IN')}`,
        inputValue: `₹${currentCell.basicPay.toLocaleString('en-IN')}`,
        outputValue: `₹${notionalPay.toLocaleString('en-IN')}`,
        notes: 'Notional figure computed for matrix fitting.'
      },
      {
        stepNumber: 3,
        title: `Fitment into Promotional Level ${promotionalLevel}`,
        description: `Locate figure in Level ${promotionalLevel} matrix equal to or immediately higher than notional pay ₹${notionalPay.toLocaleString('en-IN')}.`,
        formula: `Fitment Rule: Equal or Next Higher (${matchType})`,
        inputValue: `₹${notionalPay.toLocaleString('en-IN')}`,
        outputValue: `Level ${promotionalLevel}, Cell ${targetPromoCell.cellNumber} (₹${targetPromoCell.basicPay.toLocaleString('en-IN')})`
      },
      {
        stepNumber: 4,
        title: 'Fixation of New Basic Pay & Next Increment',
        description: `Substantive Basic Pay fixed at ₹${targetPromoCell.basicPay.toLocaleString('en-IN')}. Next annual increment falls due after 6 months of qualifying service.`,
        formula: 'Final Fixation Figure',
        outputValue: `₹${targetPromoCell.basicPay.toLocaleString('en-IN')}`
      }
    ];

    const allowances = this.calculateAllowances(targetPromoCell.basicPay, promotionalLevel, cityCategory);

    return {
      previousBasicPay: currentCell.basicPay,
      previousLevel: currentLevel,
      previousCell: currentCellNumber,
      newBasicPay: targetPromoCell.basicPay,
      newLevel: promotionalLevel,
      newCell: targetPromoCell.cellNumber,
      calculationSteps: steps,
      nextIncrementDate: '01-01-2027',
      ...allowances
    };
  }

  /**
   * Commission Revision Fixation (e.g., 6th to 7th or 7th to 8th CPC)
   */
  static calculateCommissionRevision(
    previousBasicPay: number,
    previousLevel: string,
    targetLevel: string,
    fitmentFactor: number,
    targetMatrix: Record<string, { cellNumber: number; basicPay: number }[]>,
    cityCategory: CityCategory = 'X'
  ): CalculationResult {
    const rawMultiplied = previousBasicPay * fitmentFactor;
    const roundedTo100 = Math.round(rawMultiplied / 100) * 100;

    const promoLevelCells = targetMatrix[targetLevel] || [];
    let matchedCell = promoLevelCells.find(c => c.basicPay === roundedTo100);
    let matchType = 'Exact Cell Match';

    if (!matchedCell) {
      matchedCell = promoLevelCells.find(c => c.basicPay > roundedTo100);
      matchType = 'Next Higher Cell in Matrix';
    }

    const finalCell = matchedCell || (promoLevelCells.length > 0 ? promoLevelCells[promoLevelCells.length - 1] : { cellNumber: 1, basicPay: roundedTo100 });

    const steps: CalculationStep[] = [
      {
        stepNumber: 1,
        title: 'Pre-Revision Basic Pay',
        description: `Substantive Basic Pay before pay revision in existing pay structure.`,
        inputValue: `₹${previousBasicPay.toLocaleString('en-IN')}`,
        outputValue: `₹${previousBasicPay.toLocaleString('en-IN')}`
      },
      {
        stepNumber: 2,
        title: 'Application of Fitment Factor Multiplier',
        description: `Multiply pre-revised basic pay by the official Fitment Factor (${fitmentFactor}).`,
        formula: `₹${previousBasicPay} × ${fitmentFactor} = ₹${rawMultiplied.toFixed(2)}`,
        inputValue: `Fitment: ${fitmentFactor}`,
        outputValue: `₹${rawMultiplied.toFixed(2)}`
      },
      {
        stepNumber: 3,
        title: 'Rounding to Nearest Multiple of 100',
        description: 'Under Commission rules, intermediate product is rounded to the nearest multiple of Rs. 100.',
        formula: 'Round to nearest 100',
        inputValue: `₹${rawMultiplied.toFixed(2)}`,
        outputValue: `₹${roundedTo100.toLocaleString('en-IN')}`
      },
      {
        stepNumber: 4,
        title: `Fitting into Revised Commission Matrix (Level ${targetLevel})`,
        description: `Locate stage in Level ${targetLevel} matrix equal to or next higher than ₹${roundedTo100.toLocaleString('en-IN')}.`,
        formula: `Level ${targetLevel} (${matchType})`,
        inputValue: `₹${roundedTo100.toLocaleString('en-IN')}`,
        outputValue: `Cell ${finalCell.cellNumber} (₹${finalCell.basicPay.toLocaleString('en-IN')})`
      }
    ];

    const allowances = this.calculateAllowances(finalCell.basicPay, targetLevel, cityCategory);

    return {
      previousBasicPay,
      previousLevel,
      previousCell: 1,
      newBasicPay: finalCell.basicPay,
      newLevel: targetLevel,
      newCell: finalCell.cellNumber,
      calculationSteps: steps,
      nextIncrementDate: '01-07-2027',
      ...allowances
    };
  }

  /**
   * Calculate standard allowances (DA, HRA, TA) and Gross Pay
   */
  static calculateAllowances(basicPay: number, levelNumber: string, cityCategory: CityCategory = 'X') {
    // Current DA is 50%
    const daRate = 0.50;
    const daAmount = Math.round(basicPay * daRate);

    // HRA Rates: X: 30%, Y: 20%, Z: 10%
    let hraRate = 0.30;
    if (cityCategory === 'Y') hraRate = 0.20;
    if (cityCategory === 'Z') hraRate = 0.10;
    const hraAmount = Math.round(basicPay * hraRate);

    // Transport Allowance (TA) based on level
    const levelNum = parseInt(levelNumber, 10) || 1;
    let baseTA = 3600;
    if (levelNum >= 9) baseTA = 7200;
    else if (levelNum <= 2) baseTA = 1350;

    const taAmount = Math.round(baseTA * (1 + daRate));
    const grossPay = basicPay + daAmount + hraAmount + taAmount;

    return { daAmount, hraAmount, taAmount, grossPay };
  }

  /**
   * Calculate Due vs Drawn Month-by-Month Arrears
   */
  static calculateArrears(
    effectiveDateStr: string,
    implementationDateStr: string,
    drawnBasic: number,
    dueBasic: number,
    levelNumber: string,
    cityCategory: CityCategory = 'X'
  ): { breakdown: ArrearsMonthBreakdown[]; totalNetArrears: number } {
    const startDate = new Date(effectiveDateStr);
    const endDate = new Date(implementationDateStr);

    const breakdown: ArrearsMonthBreakdown[] = [];
    let totalNetArrears = 0;

    const curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const dueAllowances = this.calculateAllowances(dueBasic, levelNumber, cityCategory);
    const drawnAllowances = this.calculateAllowances(drawnBasic, levelNumber, cityCategory);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (curr <= end) {
      const label = `${monthNames[curr.getMonth()]} ${curr.getFullYear()}`;
      const diffBasic = dueBasic - drawnBasic;
      const diffDA = dueAllowances.daAmount - drawnAllowances.daAmount;
      const diffHRA = dueAllowances.hraAmount - drawnAllowances.hraAmount;
      const diffTA = dueAllowances.taAmount - drawnAllowances.taAmount;
      const netArrears = diffBasic + diffDA + diffHRA + diffTA;

      breakdown.push({
        monthYear: label,
        dueBasic,
        drawnBasic,
        diffBasic,
        dueDA: dueAllowances.daAmount,
        drawnDA: drawnAllowances.daAmount,
        diffDA,
        dueHRA: dueAllowances.hraAmount,
        drawnHRA: drawnAllowances.hraAmount,
        diffHRA,
        dueTA: dueAllowances.taAmount,
        drawnTA: drawnAllowances.taAmount,
        diffTA,
        netArrears
      });

      totalNetArrears += netArrears;
      curr.setMonth(curr.getMonth() + 1);
    }

    return { breakdown, totalNetArrears };
  }
}
