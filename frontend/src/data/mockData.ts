import { PayCommission, PayLevel, Employee, PayFixationRecord, PayRule, AuditLogItem } from '../types';

export const INITIAL_PAY_MATRIX: Record<string, { cellNumber: number; basicPay: number }[]> = {
  "1": [
    {
      "cellNumber": 1,
      "basicPay": 18000
    },
    {
      "cellNumber": 2,
      "basicPay": 18500
    },
    {
      "cellNumber": 3,
      "basicPay": 19100
    },
    {
      "cellNumber": 4,
      "basicPay": 19700
    },
    {
      "cellNumber": 5,
      "basicPay": 20300
    },
    {
      "cellNumber": 6,
      "basicPay": 20900
    },
    {
      "cellNumber": 7,
      "basicPay": 21500
    },
    {
      "cellNumber": 8,
      "basicPay": 22100
    },
    {
      "cellNumber": 9,
      "basicPay": 22800
    },
    {
      "cellNumber": 10,
      "basicPay": 23500
    },
    {
      "cellNumber": 11,
      "basicPay": 24200
    },
    {
      "cellNumber": 12,
      "basicPay": 24900
    },
    {
      "cellNumber": 13,
      "basicPay": 25600
    },
    {
      "cellNumber": 14,
      "basicPay": 26400
    },
    {
      "cellNumber": 15,
      "basicPay": 27200
    },
    {
      "cellNumber": 16,
      "basicPay": 28000
    },
    {
      "cellNumber": 17,
      "basicPay": 28800
    },
    {
      "cellNumber": 18,
      "basicPay": 29700
    },
    {
      "cellNumber": 19,
      "basicPay": 30600
    },
    {
      "cellNumber": 20,
      "basicPay": 31500
    },
    {
      "cellNumber": 21,
      "basicPay": 32400
    },
    {
      "cellNumber": 22,
      "basicPay": 33400
    },
    {
      "cellNumber": 23,
      "basicPay": 34400
    },
    {
      "cellNumber": 24,
      "basicPay": 35400
    },
    {
      "cellNumber": 25,
      "basicPay": 36500
    },
    {
      "cellNumber": 26,
      "basicPay": 37600
    },
    {
      "cellNumber": 27,
      "basicPay": 38700
    },
    {
      "cellNumber": 28,
      "basicPay": 39900
    },
    {
      "cellNumber": 29,
      "basicPay": 41100
    },
    {
      "cellNumber": 30,
      "basicPay": 42300
    },
    {
      "cellNumber": 31,
      "basicPay": 43600
    },
    {
      "cellNumber": 32,
      "basicPay": 44900
    },
    {
      "cellNumber": 33,
      "basicPay": 46200
    },
    {
      "cellNumber": 34,
      "basicPay": 47600
    },
    {
      "cellNumber": 35,
      "basicPay": 49000
    },
    {
      "cellNumber": 36,
      "basicPay": 50500
    },
    {
      "cellNumber": 37,
      "basicPay": 52000
    },
    {
      "cellNumber": 38,
      "basicPay": 53600
    },
    {
      "cellNumber": 39,
      "basicPay": 55200
    },
    {
      "cellNumber": 40,
      "basicPay": 56900
    }
  ],
  "2": [
    {
      "cellNumber": 1,
      "basicPay": 19900
    },
    {
      "cellNumber": 2,
      "basicPay": 20500
    },
    {
      "cellNumber": 3,
      "basicPay": 21100
    },
    {
      "cellNumber": 4,
      "basicPay": 21700
    },
    {
      "cellNumber": 5,
      "basicPay": 22400
    },
    {
      "cellNumber": 6,
      "basicPay": 23100
    },
    {
      "cellNumber": 7,
      "basicPay": 23800
    },
    {
      "cellNumber": 8,
      "basicPay": 24500
    },
    {
      "cellNumber": 9,
      "basicPay": 25200
    },
    {
      "cellNumber": 10,
      "basicPay": 26000
    },
    {
      "cellNumber": 11,
      "basicPay": 26800
    },
    {
      "cellNumber": 12,
      "basicPay": 27600
    },
    {
      "cellNumber": 13,
      "basicPay": 28400
    },
    {
      "cellNumber": 14,
      "basicPay": 29300
    },
    {
      "cellNumber": 15,
      "basicPay": 30200
    },
    {
      "cellNumber": 16,
      "basicPay": 31100
    },
    {
      "cellNumber": 17,
      "basicPay": 32000
    },
    {
      "cellNumber": 18,
      "basicPay": 33000
    },
    {
      "cellNumber": 19,
      "basicPay": 34000
    },
    {
      "cellNumber": 20,
      "basicPay": 35000
    },
    {
      "cellNumber": 21,
      "basicPay": 36100
    },
    {
      "cellNumber": 22,
      "basicPay": 37200
    },
    {
      "cellNumber": 23,
      "basicPay": 38300
    },
    {
      "cellNumber": 24,
      "basicPay": 39400
    },
    {
      "cellNumber": 25,
      "basicPay": 40600
    },
    {
      "cellNumber": 26,
      "basicPay": 41800
    },
    {
      "cellNumber": 27,
      "basicPay": 43100
    },
    {
      "cellNumber": 28,
      "basicPay": 44400
    },
    {
      "cellNumber": 29,
      "basicPay": 45700
    },
    {
      "cellNumber": 30,
      "basicPay": 47100
    },
    {
      "cellNumber": 31,
      "basicPay": 48500
    },
    {
      "cellNumber": 32,
      "basicPay": 50000
    },
    {
      "cellNumber": 33,
      "basicPay": 51500
    },
    {
      "cellNumber": 34,
      "basicPay": 53000
    },
    {
      "cellNumber": 35,
      "basicPay": 54600
    },
    {
      "cellNumber": 36,
      "basicPay": 56200
    },
    {
      "cellNumber": 37,
      "basicPay": 57900
    },
    {
      "cellNumber": 38,
      "basicPay": 59600
    },
    {
      "cellNumber": 39,
      "basicPay": 61400
    },
    {
      "cellNumber": 40,
      "basicPay": 63200
    }
  ],
  "3": [
    {
      "cellNumber": 1,
      "basicPay": 21700
    },
    {
      "cellNumber": 2,
      "basicPay": 22400
    },
    {
      "cellNumber": 3,
      "basicPay": 23100
    },
    {
      "cellNumber": 4,
      "basicPay": 23800
    },
    {
      "cellNumber": 5,
      "basicPay": 24500
    },
    {
      "cellNumber": 6,
      "basicPay": 25200
    },
    {
      "cellNumber": 7,
      "basicPay": 26000
    },
    {
      "cellNumber": 8,
      "basicPay": 26800
    },
    {
      "cellNumber": 9,
      "basicPay": 27600
    },
    {
      "cellNumber": 10,
      "basicPay": 28400
    },
    {
      "cellNumber": 11,
      "basicPay": 29300
    },
    {
      "cellNumber": 12,
      "basicPay": 30200
    },
    {
      "cellNumber": 13,
      "basicPay": 31100
    },
    {
      "cellNumber": 14,
      "basicPay": 32000
    },
    {
      "cellNumber": 15,
      "basicPay": 33000
    },
    {
      "cellNumber": 16,
      "basicPay": 34000
    },
    {
      "cellNumber": 17,
      "basicPay": 35000
    },
    {
      "cellNumber": 18,
      "basicPay": 36100
    },
    {
      "cellNumber": 19,
      "basicPay": 37200
    },
    {
      "cellNumber": 20,
      "basicPay": 38300
    },
    {
      "cellNumber": 21,
      "basicPay": 39400
    },
    {
      "cellNumber": 22,
      "basicPay": 40600
    },
    {
      "cellNumber": 23,
      "basicPay": 41800
    },
    {
      "cellNumber": 24,
      "basicPay": 43100
    },
    {
      "cellNumber": 25,
      "basicPay": 44400
    },
    {
      "cellNumber": 26,
      "basicPay": 45700
    },
    {
      "cellNumber": 27,
      "basicPay": 47100
    },
    {
      "cellNumber": 28,
      "basicPay": 48500
    },
    {
      "cellNumber": 29,
      "basicPay": 50000
    },
    {
      "cellNumber": 30,
      "basicPay": 51500
    },
    {
      "cellNumber": 31,
      "basicPay": 53000
    },
    {
      "cellNumber": 32,
      "basicPay": 54600
    },
    {
      "cellNumber": 33,
      "basicPay": 56200
    },
    {
      "cellNumber": 34,
      "basicPay": 57900
    },
    {
      "cellNumber": 35,
      "basicPay": 59600
    },
    {
      "cellNumber": 36,
      "basicPay": 61400
    },
    {
      "cellNumber": 37,
      "basicPay": 63200
    },
    {
      "cellNumber": 38,
      "basicPay": 65100
    },
    {
      "cellNumber": 39,
      "basicPay": 67100
    },
    {
      "cellNumber": 40,
      "basicPay": 69100
    }
  ],
  "4": [
    {
      "cellNumber": 1,
      "basicPay": 25500
    },
    {
      "cellNumber": 2,
      "basicPay": 26300
    },
    {
      "cellNumber": 3,
      "basicPay": 27100
    },
    {
      "cellNumber": 4,
      "basicPay": 27900
    },
    {
      "cellNumber": 5,
      "basicPay": 28700
    },
    {
      "cellNumber": 6,
      "basicPay": 29600
    },
    {
      "cellNumber": 7,
      "basicPay": 30500
    },
    {
      "cellNumber": 8,
      "basicPay": 31400
    },
    {
      "cellNumber": 9,
      "basicPay": 32300
    },
    {
      "cellNumber": 10,
      "basicPay": 33300
    },
    {
      "cellNumber": 11,
      "basicPay": 34300
    },
    {
      "cellNumber": 12,
      "basicPay": 35300
    },
    {
      "cellNumber": 13,
      "basicPay": 36400
    },
    {
      "cellNumber": 14,
      "basicPay": 37500
    },
    {
      "cellNumber": 15,
      "basicPay": 38600
    },
    {
      "cellNumber": 16,
      "basicPay": 39800
    },
    {
      "cellNumber": 17,
      "basicPay": 41000
    },
    {
      "cellNumber": 18,
      "basicPay": 42200
    },
    {
      "cellNumber": 19,
      "basicPay": 43500
    },
    {
      "cellNumber": 20,
      "basicPay": 44800
    },
    {
      "cellNumber": 21,
      "basicPay": 46100
    },
    {
      "cellNumber": 22,
      "basicPay": 47500
    },
    {
      "cellNumber": 23,
      "basicPay": 48900
    },
    {
      "cellNumber": 24,
      "basicPay": 50400
    },
    {
      "cellNumber": 25,
      "basicPay": 51900
    },
    {
      "cellNumber": 26,
      "basicPay": 53500
    },
    {
      "cellNumber": 27,
      "basicPay": 55100
    },
    {
      "cellNumber": 28,
      "basicPay": 56800
    },
    {
      "cellNumber": 29,
      "basicPay": 58500
    },
    {
      "cellNumber": 30,
      "basicPay": 60300
    },
    {
      "cellNumber": 31,
      "basicPay": 62100
    },
    {
      "cellNumber": 32,
      "basicPay": 64000
    },
    {
      "cellNumber": 33,
      "basicPay": 65900
    },
    {
      "cellNumber": 34,
      "basicPay": 67900
    },
    {
      "cellNumber": 35,
      "basicPay": 69900
    },
    {
      "cellNumber": 36,
      "basicPay": 72000
    },
    {
      "cellNumber": 37,
      "basicPay": 74200
    },
    {
      "cellNumber": 38,
      "basicPay": 76400
    },
    {
      "cellNumber": 39,
      "basicPay": 78700
    },
    {
      "cellNumber": 40,
      "basicPay": 81100
    }
  ],
  "5": [
    {
      "cellNumber": 1,
      "basicPay": 29200
    },
    {
      "cellNumber": 2,
      "basicPay": 30100
    },
    {
      "cellNumber": 3,
      "basicPay": 31000
    },
    {
      "cellNumber": 4,
      "basicPay": 31900
    },
    {
      "cellNumber": 5,
      "basicPay": 32900
    },
    {
      "cellNumber": 6,
      "basicPay": 33900
    },
    {
      "cellNumber": 7,
      "basicPay": 34900
    },
    {
      "cellNumber": 8,
      "basicPay": 35900
    },
    {
      "cellNumber": 9,
      "basicPay": 37000
    },
    {
      "cellNumber": 10,
      "basicPay": 38100
    },
    {
      "cellNumber": 11,
      "basicPay": 39200
    },
    {
      "cellNumber": 12,
      "basicPay": 40400
    },
    {
      "cellNumber": 13,
      "basicPay": 41600
    },
    {
      "cellNumber": 14,
      "basicPay": 42800
    },
    {
      "cellNumber": 15,
      "basicPay": 44100
    },
    {
      "cellNumber": 16,
      "basicPay": 45400
    },
    {
      "cellNumber": 17,
      "basicPay": 46800
    },
    {
      "cellNumber": 18,
      "basicPay": 48200
    },
    {
      "cellNumber": 19,
      "basicPay": 49600
    },
    {
      "cellNumber": 20,
      "basicPay": 51100
    },
    {
      "cellNumber": 21,
      "basicPay": 52600
    },
    {
      "cellNumber": 22,
      "basicPay": 54200
    },
    {
      "cellNumber": 23,
      "basicPay": 55800
    },
    {
      "cellNumber": 24,
      "basicPay": 57500
    },
    {
      "cellNumber": 25,
      "basicPay": 59200
    },
    {
      "cellNumber": 26,
      "basicPay": 61000
    },
    {
      "cellNumber": 27,
      "basicPay": 62800
    },
    {
      "cellNumber": 28,
      "basicPay": 64700
    },
    {
      "cellNumber": 29,
      "basicPay": 66600
    },
    {
      "cellNumber": 30,
      "basicPay": 68600
    },
    {
      "cellNumber": 31,
      "basicPay": 70700
    },
    {
      "cellNumber": 32,
      "basicPay": 72800
    },
    {
      "cellNumber": 33,
      "basicPay": 75000
    },
    {
      "cellNumber": 34,
      "basicPay": 77300
    },
    {
      "cellNumber": 35,
      "basicPay": 79600
    },
    {
      "cellNumber": 36,
      "basicPay": 82000
    },
    {
      "cellNumber": 37,
      "basicPay": 84500
    },
    {
      "cellNumber": 38,
      "basicPay": 87000
    },
    {
      "cellNumber": 39,
      "basicPay": 89600
    },
    {
      "cellNumber": 40,
      "basicPay": 92300
    }
  ],
  "6": [
    {
      "cellNumber": 1,
      "basicPay": 35400
    },
    {
      "cellNumber": 2,
      "basicPay": 36500
    },
    {
      "cellNumber": 3,
      "basicPay": 37600
    },
    {
      "cellNumber": 4,
      "basicPay": 38700
    },
    {
      "cellNumber": 5,
      "basicPay": 39900
    },
    {
      "cellNumber": 6,
      "basicPay": 41100
    },
    {
      "cellNumber": 7,
      "basicPay": 42300
    },
    {
      "cellNumber": 8,
      "basicPay": 43600
    },
    {
      "cellNumber": 9,
      "basicPay": 44900
    },
    {
      "cellNumber": 10,
      "basicPay": 46200
    },
    {
      "cellNumber": 11,
      "basicPay": 47600
    },
    {
      "cellNumber": 12,
      "basicPay": 49000
    },
    {
      "cellNumber": 13,
      "basicPay": 50500
    },
    {
      "cellNumber": 14,
      "basicPay": 52000
    },
    {
      "cellNumber": 15,
      "basicPay": 53600
    },
    {
      "cellNumber": 16,
      "basicPay": 55200
    },
    {
      "cellNumber": 17,
      "basicPay": 56900
    },
    {
      "cellNumber": 18,
      "basicPay": 58600
    },
    {
      "cellNumber": 19,
      "basicPay": 60400
    },
    {
      "cellNumber": 20,
      "basicPay": 62200
    },
    {
      "cellNumber": 21,
      "basicPay": 64100
    },
    {
      "cellNumber": 22,
      "basicPay": 66000
    },
    {
      "cellNumber": 23,
      "basicPay": 68000
    },
    {
      "cellNumber": 24,
      "basicPay": 70000
    },
    {
      "cellNumber": 25,
      "basicPay": 72100
    },
    {
      "cellNumber": 26,
      "basicPay": 74300
    },
    {
      "cellNumber": 27,
      "basicPay": 76500
    },
    {
      "cellNumber": 28,
      "basicPay": 78800
    },
    {
      "cellNumber": 29,
      "basicPay": 81200
    },
    {
      "cellNumber": 30,
      "basicPay": 83600
    },
    {
      "cellNumber": 31,
      "basicPay": 86100
    },
    {
      "cellNumber": 32,
      "basicPay": 88700
    },
    {
      "cellNumber": 33,
      "basicPay": 91400
    },
    {
      "cellNumber": 34,
      "basicPay": 94100
    },
    {
      "cellNumber": 35,
      "basicPay": 96900
    },
    {
      "cellNumber": 36,
      "basicPay": 99800
    },
    {
      "cellNumber": 37,
      "basicPay": 102800
    },
    {
      "cellNumber": 38,
      "basicPay": 105900
    },
    {
      "cellNumber": 39,
      "basicPay": 109100
    },
    {
      "cellNumber": 40,
      "basicPay": 112400
    }
  ],
  "7": [
    {
      "cellNumber": 1,
      "basicPay": 44900
    },
    {
      "cellNumber": 2,
      "basicPay": 46200
    },
    {
      "cellNumber": 3,
      "basicPay": 47600
    },
    {
      "cellNumber": 4,
      "basicPay": 49000
    },
    {
      "cellNumber": 5,
      "basicPay": 50500
    },
    {
      "cellNumber": 6,
      "basicPay": 52000
    },
    {
      "cellNumber": 7,
      "basicPay": 53600
    },
    {
      "cellNumber": 8,
      "basicPay": 55200
    },
    {
      "cellNumber": 9,
      "basicPay": 56900
    },
    {
      "cellNumber": 10,
      "basicPay": 58600
    },
    {
      "cellNumber": 11,
      "basicPay": 60400
    },
    {
      "cellNumber": 12,
      "basicPay": 62200
    },
    {
      "cellNumber": 13,
      "basicPay": 64100
    },
    {
      "cellNumber": 14,
      "basicPay": 66000
    },
    {
      "cellNumber": 15,
      "basicPay": 68000
    },
    {
      "cellNumber": 16,
      "basicPay": 70000
    },
    {
      "cellNumber": 17,
      "basicPay": 72100
    },
    {
      "cellNumber": 18,
      "basicPay": 74300
    },
    {
      "cellNumber": 19,
      "basicPay": 76500
    },
    {
      "cellNumber": 20,
      "basicPay": 78800
    },
    {
      "cellNumber": 21,
      "basicPay": 81200
    },
    {
      "cellNumber": 22,
      "basicPay": 83600
    },
    {
      "cellNumber": 23,
      "basicPay": 86100
    },
    {
      "cellNumber": 24,
      "basicPay": 88700
    },
    {
      "cellNumber": 25,
      "basicPay": 91400
    },
    {
      "cellNumber": 26,
      "basicPay": 94100
    },
    {
      "cellNumber": 27,
      "basicPay": 96900
    },
    {
      "cellNumber": 28,
      "basicPay": 99800
    },
    {
      "cellNumber": 29,
      "basicPay": 102800
    },
    {
      "cellNumber": 30,
      "basicPay": 105900
    },
    {
      "cellNumber": 31,
      "basicPay": 109100
    },
    {
      "cellNumber": 32,
      "basicPay": 112400
    },
    {
      "cellNumber": 33,
      "basicPay": 115800
    },
    {
      "cellNumber": 34,
      "basicPay": 119300
    },
    {
      "cellNumber": 35,
      "basicPay": 122900
    },
    {
      "cellNumber": 36,
      "basicPay": 126600
    },
    {
      "cellNumber": 37,
      "basicPay": 130400
    },
    {
      "cellNumber": 38,
      "basicPay": 134300
    },
    {
      "cellNumber": 39,
      "basicPay": 138300
    },
    {
      "cellNumber": 40,
      "basicPay": 142400
    }
  ],
  "8": [
    {
      "cellNumber": 1,
      "basicPay": 47600
    },
    {
      "cellNumber": 2,
      "basicPay": 49000
    },
    {
      "cellNumber": 3,
      "basicPay": 50500
    },
    {
      "cellNumber": 4,
      "basicPay": 52000
    },
    {
      "cellNumber": 5,
      "basicPay": 53600
    },
    {
      "cellNumber": 6,
      "basicPay": 55200
    },
    {
      "cellNumber": 7,
      "basicPay": 56900
    },
    {
      "cellNumber": 8,
      "basicPay": 58600
    },
    {
      "cellNumber": 9,
      "basicPay": 60400
    },
    {
      "cellNumber": 10,
      "basicPay": 62200
    },
    {
      "cellNumber": 11,
      "basicPay": 64100
    },
    {
      "cellNumber": 12,
      "basicPay": 66000
    },
    {
      "cellNumber": 13,
      "basicPay": 68000
    },
    {
      "cellNumber": 14,
      "basicPay": 70000
    },
    {
      "cellNumber": 15,
      "basicPay": 72100
    },
    {
      "cellNumber": 16,
      "basicPay": 74300
    },
    {
      "cellNumber": 17,
      "basicPay": 76500
    },
    {
      "cellNumber": 18,
      "basicPay": 78800
    },
    {
      "cellNumber": 19,
      "basicPay": 81200
    },
    {
      "cellNumber": 20,
      "basicPay": 83600
    },
    {
      "cellNumber": 21,
      "basicPay": 86100
    },
    {
      "cellNumber": 22,
      "basicPay": 88700
    },
    {
      "cellNumber": 23,
      "basicPay": 91400
    },
    {
      "cellNumber": 24,
      "basicPay": 94100
    },
    {
      "cellNumber": 25,
      "basicPay": 96900
    },
    {
      "cellNumber": 26,
      "basicPay": 99800
    },
    {
      "cellNumber": 27,
      "basicPay": 102800
    },
    {
      "cellNumber": 28,
      "basicPay": 105900
    },
    {
      "cellNumber": 29,
      "basicPay": 109100
    },
    {
      "cellNumber": 30,
      "basicPay": 112400
    },
    {
      "cellNumber": 31,
      "basicPay": 115800
    },
    {
      "cellNumber": 32,
      "basicPay": 119300
    },
    {
      "cellNumber": 33,
      "basicPay": 122900
    },
    {
      "cellNumber": 34,
      "basicPay": 126600
    },
    {
      "cellNumber": 35,
      "basicPay": 130400
    },
    {
      "cellNumber": 36,
      "basicPay": 134300
    },
    {
      "cellNumber": 37,
      "basicPay": 138300
    },
    {
      "cellNumber": 38,
      "basicPay": 142400
    },
    {
      "cellNumber": 39,
      "basicPay": 146700
    },
    {
      "cellNumber": 40,
      "basicPay": 151100
    }
  ],
  "9": [
    {
      "cellNumber": 1,
      "basicPay": 53100
    },
    {
      "cellNumber": 2,
      "basicPay": 54700
    },
    {
      "cellNumber": 3,
      "basicPay": 56300
    },
    {
      "cellNumber": 4,
      "basicPay": 58000
    },
    {
      "cellNumber": 5,
      "basicPay": 59700
    },
    {
      "cellNumber": 6,
      "basicPay": 61500
    },
    {
      "cellNumber": 7,
      "basicPay": 63300
    },
    {
      "cellNumber": 8,
      "basicPay": 65200
    },
    {
      "cellNumber": 9,
      "basicPay": 67200
    },
    {
      "cellNumber": 10,
      "basicPay": 69200
    },
    {
      "cellNumber": 11,
      "basicPay": 71300
    },
    {
      "cellNumber": 12,
      "basicPay": 73400
    },
    {
      "cellNumber": 13,
      "basicPay": 75600
    },
    {
      "cellNumber": 14,
      "basicPay": 77900
    },
    {
      "cellNumber": 15,
      "basicPay": 80200
    },
    {
      "cellNumber": 16,
      "basicPay": 82600
    },
    {
      "cellNumber": 17,
      "basicPay": 85100
    },
    {
      "cellNumber": 18,
      "basicPay": 87700
    },
    {
      "cellNumber": 19,
      "basicPay": 90300
    },
    {
      "cellNumber": 20,
      "basicPay": 93000
    },
    {
      "cellNumber": 21,
      "basicPay": 95800
    },
    {
      "cellNumber": 22,
      "basicPay": 98700
    },
    {
      "cellNumber": 23,
      "basicPay": 101700
    },
    {
      "cellNumber": 24,
      "basicPay": 104800
    },
    {
      "cellNumber": 25,
      "basicPay": 107900
    },
    {
      "cellNumber": 26,
      "basicPay": 111100
    },
    {
      "cellNumber": 27,
      "basicPay": 114400
    },
    {
      "cellNumber": 28,
      "basicPay": 117800
    },
    {
      "cellNumber": 29,
      "basicPay": 121300
    },
    {
      "cellNumber": 30,
      "basicPay": 124900
    },
    {
      "cellNumber": 31,
      "basicPay": 128600
    },
    {
      "cellNumber": 32,
      "basicPay": 132500
    },
    {
      "cellNumber": 33,
      "basicPay": 136500
    },
    {
      "cellNumber": 34,
      "basicPay": 140600
    },
    {
      "cellNumber": 35,
      "basicPay": 144800
    },
    {
      "cellNumber": 36,
      "basicPay": 149100
    },
    {
      "cellNumber": 37,
      "basicPay": 153600
    },
    {
      "cellNumber": 38,
      "basicPay": 158200
    },
    {
      "cellNumber": 39,
      "basicPay": 162900
    },
    {
      "cellNumber": 40,
      "basicPay": 167800
    }
  ],
  "10": [
    {
      "cellNumber": 1,
      "basicPay": 56100
    },
    {
      "cellNumber": 2,
      "basicPay": 57800
    },
    {
      "cellNumber": 3,
      "basicPay": 59500
    },
    {
      "cellNumber": 4,
      "basicPay": 61300
    },
    {
      "cellNumber": 5,
      "basicPay": 63100
    },
    {
      "cellNumber": 6,
      "basicPay": 65000
    },
    {
      "cellNumber": 7,
      "basicPay": 67000
    },
    {
      "cellNumber": 8,
      "basicPay": 69000
    },
    {
      "cellNumber": 9,
      "basicPay": 71100
    },
    {
      "cellNumber": 10,
      "basicPay": 73200
    },
    {
      "cellNumber": 11,
      "basicPay": 75400
    },
    {
      "cellNumber": 12,
      "basicPay": 77700
    },
    {
      "cellNumber": 13,
      "basicPay": 80000
    },
    {
      "cellNumber": 14,
      "basicPay": 82400
    },
    {
      "cellNumber": 15,
      "basicPay": 84900
    },
    {
      "cellNumber": 16,
      "basicPay": 87400
    },
    {
      "cellNumber": 17,
      "basicPay": 90000
    },
    {
      "cellNumber": 18,
      "basicPay": 92700
    },
    {
      "cellNumber": 19,
      "basicPay": 95500
    },
    {
      "cellNumber": 20,
      "basicPay": 98400
    },
    {
      "cellNumber": 21,
      "basicPay": 101400
    },
    {
      "cellNumber": 22,
      "basicPay": 104400
    },
    {
      "cellNumber": 23,
      "basicPay": 107500
    },
    {
      "cellNumber": 24,
      "basicPay": 110700
    },
    {
      "cellNumber": 25,
      "basicPay": 114000
    },
    {
      "cellNumber": 26,
      "basicPay": 117400
    },
    {
      "cellNumber": 27,
      "basicPay": 120900
    },
    {
      "cellNumber": 28,
      "basicPay": 124500
    },
    {
      "cellNumber": 29,
      "basicPay": 128200
    },
    {
      "cellNumber": 30,
      "basicPay": 132000
    },
    {
      "cellNumber": 31,
      "basicPay": 136000
    },
    {
      "cellNumber": 32,
      "basicPay": 140100
    },
    {
      "cellNumber": 33,
      "basicPay": 144300
    },
    {
      "cellNumber": 34,
      "basicPay": 148600
    },
    {
      "cellNumber": 35,
      "basicPay": 153100
    },
    {
      "cellNumber": 36,
      "basicPay": 157700
    },
    {
      "cellNumber": 37,
      "basicPay": 162400
    },
    {
      "cellNumber": 38,
      "basicPay": 167300
    },
    {
      "cellNumber": 39,
      "basicPay": 172300
    },
    {
      "cellNumber": 40,
      "basicPay": 177500
    }
  ],
  "11": [
    {
      "cellNumber": 1,
      "basicPay": 67700
    },
    {
      "cellNumber": 2,
      "basicPay": 69700
    },
    {
      "cellNumber": 3,
      "basicPay": 71800
    },
    {
      "cellNumber": 4,
      "basicPay": 74000
    },
    {
      "cellNumber": 5,
      "basicPay": 76200
    },
    {
      "cellNumber": 6,
      "basicPay": 78500
    },
    {
      "cellNumber": 7,
      "basicPay": 80900
    },
    {
      "cellNumber": 8,
      "basicPay": 83300
    },
    {
      "cellNumber": 9,
      "basicPay": 85800
    },
    {
      "cellNumber": 10,
      "basicPay": 88400
    },
    {
      "cellNumber": 11,
      "basicPay": 91100
    },
    {
      "cellNumber": 12,
      "basicPay": 93800
    },
    {
      "cellNumber": 13,
      "basicPay": 96600
    },
    {
      "cellNumber": 14,
      "basicPay": 99500
    },
    {
      "cellNumber": 15,
      "basicPay": 102500
    },
    {
      "cellNumber": 16,
      "basicPay": 105600
    },
    {
      "cellNumber": 17,
      "basicPay": 108800
    },
    {
      "cellNumber": 18,
      "basicPay": 112100
    },
    {
      "cellNumber": 19,
      "basicPay": 115500
    },
    {
      "cellNumber": 20,
      "basicPay": 119000
    },
    {
      "cellNumber": 21,
      "basicPay": 122600
    },
    {
      "cellNumber": 22,
      "basicPay": 126300
    },
    {
      "cellNumber": 23,
      "basicPay": 130100
    },
    {
      "cellNumber": 24,
      "basicPay": 134000
    },
    {
      "cellNumber": 25,
      "basicPay": 138000
    },
    {
      "cellNumber": 26,
      "basicPay": 142100
    },
    {
      "cellNumber": 27,
      "basicPay": 146400
    },
    {
      "cellNumber": 28,
      "basicPay": 150800
    },
    {
      "cellNumber": 29,
      "basicPay": 155300
    },
    {
      "cellNumber": 30,
      "basicPay": 160000
    },
    {
      "cellNumber": 31,
      "basicPay": 164800
    },
    {
      "cellNumber": 32,
      "basicPay": 169700
    },
    {
      "cellNumber": 33,
      "basicPay": 174800
    },
    {
      "cellNumber": 34,
      "basicPay": 180000
    },
    {
      "cellNumber": 35,
      "basicPay": 185400
    },
    {
      "cellNumber": 36,
      "basicPay": 191000
    },
    {
      "cellNumber": 37,
      "basicPay": 196700
    },
    {
      "cellNumber": 38,
      "basicPay": 202600
    },
    {
      "cellNumber": 39,
      "basicPay": 208700
    }
  ],
  "12": [
    {
      "cellNumber": 1,
      "basicPay": 78800
    },
    {
      "cellNumber": 2,
      "basicPay": 81200
    },
    {
      "cellNumber": 3,
      "basicPay": 83600
    },
    {
      "cellNumber": 4,
      "basicPay": 86100
    },
    {
      "cellNumber": 5,
      "basicPay": 88700
    },
    {
      "cellNumber": 6,
      "basicPay": 91400
    },
    {
      "cellNumber": 7,
      "basicPay": 94100
    },
    {
      "cellNumber": 8,
      "basicPay": 96900
    },
    {
      "cellNumber": 9,
      "basicPay": 99800
    },
    {
      "cellNumber": 10,
      "basicPay": 102800
    },
    {
      "cellNumber": 11,
      "basicPay": 105900
    },
    {
      "cellNumber": 12,
      "basicPay": 109100
    },
    {
      "cellNumber": 13,
      "basicPay": 112400
    },
    {
      "cellNumber": 14,
      "basicPay": 115800
    },
    {
      "cellNumber": 15,
      "basicPay": 119300
    },
    {
      "cellNumber": 16,
      "basicPay": 122900
    },
    {
      "cellNumber": 17,
      "basicPay": 126600
    },
    {
      "cellNumber": 18,
      "basicPay": 130400
    },
    {
      "cellNumber": 19,
      "basicPay": 134300
    },
    {
      "cellNumber": 20,
      "basicPay": 138300
    },
    {
      "cellNumber": 21,
      "basicPay": 142400
    },
    {
      "cellNumber": 22,
      "basicPay": 146700
    },
    {
      "cellNumber": 23,
      "basicPay": 151100
    },
    {
      "cellNumber": 24,
      "basicPay": 155600
    },
    {
      "cellNumber": 25,
      "basicPay": 160300
    },
    {
      "cellNumber": 26,
      "basicPay": 165100
    },
    {
      "cellNumber": 27,
      "basicPay": 170100
    },
    {
      "cellNumber": 28,
      "basicPay": 175200
    },
    {
      "cellNumber": 29,
      "basicPay": 180500
    },
    {
      "cellNumber": 30,
      "basicPay": 185900
    },
    {
      "cellNumber": 31,
      "basicPay": 191500
    },
    {
      "cellNumber": 32,
      "basicPay": 197200
    },
    {
      "cellNumber": 33,
      "basicPay": 203100
    },
    {
      "cellNumber": 34,
      "basicPay": 209200
    }
  ],
  "13": [
    {
      "cellNumber": 1,
      "basicPay": 123100
    },
    {
      "cellNumber": 2,
      "basicPay": 126800
    },
    {
      "cellNumber": 3,
      "basicPay": 130600
    },
    {
      "cellNumber": 4,
      "basicPay": 134500
    },
    {
      "cellNumber": 5,
      "basicPay": 138500
    },
    {
      "cellNumber": 6,
      "basicPay": 142700
    },
    {
      "cellNumber": 7,
      "basicPay": 147000
    },
    {
      "cellNumber": 8,
      "basicPay": 151400
    },
    {
      "cellNumber": 9,
      "basicPay": 155900
    },
    {
      "cellNumber": 10,
      "basicPay": 160600
    },
    {
      "cellNumber": 11,
      "basicPay": 165400
    },
    {
      "cellNumber": 12,
      "basicPay": 170400
    },
    {
      "cellNumber": 13,
      "basicPay": 175500
    },
    {
      "cellNumber": 14,
      "basicPay": 180800
    },
    {
      "cellNumber": 15,
      "basicPay": 186200
    },
    {
      "cellNumber": 16,
      "basicPay": 191800
    },
    {
      "cellNumber": 17,
      "basicPay": 197600
    },
    {
      "cellNumber": 18,
      "basicPay": 203500
    },
    {
      "cellNumber": 19,
      "basicPay": 209600
    },
    {
      "cellNumber": 20,
      "basicPay": 215900
    },
    {
      "cellNumber": 21,
      "basicPay": 222400
    },
    {
      "cellNumber": 22,
      "basicPay": 229100
    },
    {
      "cellNumber": 23,
      "basicPay": 236000
    },
    {
      "cellNumber": 24,
      "basicPay": 243100
    },
    {
      "cellNumber": 25,
      "basicPay": 250400
    },
    {
      "cellNumber": 26,
      "basicPay": 257900
    }
  ],
  "14": [
    {
      "cellNumber": 1,
      "basicPay": 144200
    },
    {
      "cellNumber": 2,
      "basicPay": 148500
    },
    {
      "cellNumber": 3,
      "basicPay": 153000
    },
    {
      "cellNumber": 4,
      "basicPay": 157600
    },
    {
      "cellNumber": 5,
      "basicPay": 162300
    },
    {
      "cellNumber": 6,
      "basicPay": 167200
    },
    {
      "cellNumber": 7,
      "basicPay": 172200
    },
    {
      "cellNumber": 8,
      "basicPay": 177400
    },
    {
      "cellNumber": 9,
      "basicPay": 182700
    },
    {
      "cellNumber": 10,
      "basicPay": 188200
    },
    {
      "cellNumber": 11,
      "basicPay": 193800
    },
    {
      "cellNumber": 12,
      "basicPay": 199600
    },
    {
      "cellNumber": 13,
      "basicPay": 205600
    },
    {
      "cellNumber": 14,
      "basicPay": 211800
    },
    {
      "cellNumber": 15,
      "basicPay": 218200
    },
    {
      "cellNumber": 16,
      "basicPay": 224700
    },
    {
      "cellNumber": 17,
      "basicPay": 231400
    },
    {
      "cellNumber": 18,
      "basicPay": 238300
    },
    {
      "cellNumber": 19,
      "basicPay": 245400
    },
    {
      "cellNumber": 20,
      "basicPay": 252800
    },
    {
      "cellNumber": 21,
      "basicPay": 260400
    }
  ],
  "15": [
    {
      "cellNumber": 1,
      "basicPay": 182200
    },
    {
      "cellNumber": 2,
      "basicPay": 187700
    },
    {
      "cellNumber": 3,
      "basicPay": 193300
    },
    {
      "cellNumber": 4,
      "basicPay": 199100
    },
    {
      "cellNumber": 5,
      "basicPay": 205100
    },
    {
      "cellNumber": 6,
      "basicPay": 211300
    },
    {
      "cellNumber": 7,
      "basicPay": 217600
    },
    {
      "cellNumber": 8,
      "basicPay": 224100
    }
  ],
  "16": [
    {
      "cellNumber": 1,
      "basicPay": 205400
    },
    {
      "cellNumber": 2,
      "basicPay": 211600
    },
    {
      "cellNumber": 3,
      "basicPay": 217900
    },
    {
      "cellNumber": 4,
      "basicPay": 224400
    },
    {
      "cellNumber": 5,
      "basicPay": 231100
    }
  ],
  "17": [
    {
      "cellNumber": 1,
      "basicPay": 225000
    }
  ],
  "18": [
    {
      "cellNumber": 1,
      "basicPay": 250000
    }
  ],
  "13A": [
    {
      "cellNumber": 1,
      "basicPay": 131100
    },
    {
      "cellNumber": 2,
      "basicPay": 135000
    },
    {
      "cellNumber": 3,
      "basicPay": 139100
    },
    {
      "cellNumber": 4,
      "basicPay": 143300
    },
    {
      "cellNumber": 5,
      "basicPay": 147600
    },
    {
      "cellNumber": 6,
      "basicPay": 152000
    },
    {
      "cellNumber": 7,
      "basicPay": 156600
    },
    {
      "cellNumber": 8,
      "basicPay": 161300
    },
    {
      "cellNumber": 9,
      "basicPay": 166100
    },
    {
      "cellNumber": 10,
      "basicPay": 171100
    },
    {
      "cellNumber": 11,
      "basicPay": 176200
    },
    {
      "cellNumber": 12,
      "basicPay": 181500
    },
    {
      "cellNumber": 13,
      "basicPay": 186900
    },
    {
      "cellNumber": 14,
      "basicPay": 192500
    },
    {
      "cellNumber": 15,
      "basicPay": 198300
    },
    {
      "cellNumber": 16,
      "basicPay": 204200
    },
    {
      "cellNumber": 17,
      "basicPay": 210300
    },
    {
      "cellNumber": 18,
      "basicPay": 216600
    },
    {
      "cellNumber": 19,
      "basicPay": 223100
    },
    {
      "cellNumber": 20,
      "basicPay": 229800
    },
    {
      "cellNumber": 21,
      "basicPay": 236700
    },
    {
      "cellNumber": 22,
      "basicPay": 243800
    },
    {
      "cellNumber": 23,
      "basicPay": 251100
    },
    {
      "cellNumber": 24,
      "basicPay": 258600
    }
  ]
};

export const INITIAL_COMMISSIONS: PayCommission[] = [
  {
    commissionId: 7,
    commissionCode: '7CPC',
    commissionName: '7th Central Pay Commission',
    effectiveFrom: '2016-01-01',
    status: 'ACTIVE',
    fitmentFactor: 2.57,
    description: 'Current operative pay commission for Central Government & Autonomous Bodies with Pay Matrix Level 1 to 18.',
    isActive: true
  },
  {
    commissionId: 8,
    commissionCode: '8CPC',
    commissionName: '8th Central Pay Commission (Proposed / Configurable)',
    effectiveFrom: '2026-01-01',
    status: 'DRAFT',
    fitmentFactor: 1.92,
    description: 'Configurable future commission framework ready for rules, new fitment multiplier, and revised matrix definitions.',
    isActive: false
  }
];

export const INITIAL_RULES: PayRule[] = [
  {
    ruleId: 101,
    commissionId: 7,
    ruleCode: 'ANNUAL_INCREMENT_RATE',
    ruleName: 'Annual Increment Progression Rule',
    ruleDescription: 'Standard 3% notional increment compounded annually, advancing by exactly one vertical cell in the operative level.',
    ruleType: 'INCREMENT',
    parameters: { incrementPercentage: 3, advanceCells: 1, grantDates: ['01-01', '01-07'] },
    isActive: true
  },
  {
    ruleId: 102,
    commissionId: 7,
    ruleCode: 'PROMOTION_FITMENT_RULE',
    ruleName: 'Promotional Fixation Rule (FR 22(I)(a)(1))',
    ruleDescription: 'Grant 1 notional increment in current lower level; then locate equal basic pay in promotional level. If not available, fix at next higher cell.',
    ruleType: 'PROMOTION',
    parameters: { notionalIncrementsInOldLevel: 1, stepMethod: 'EQUAL_OR_NEXT_HIGHER' },
    isActive: true
  },
  {
    ruleId: 103,
    commissionId: 7,
    ruleCode: 'MACP_SELECTION_GRADE_RULE',
    ruleName: 'MACP / Selection Grade Financial Upgradation',
    ruleDescription: 'Financial upgradation to next higher pay level in matrix hierarchy with one notional increment in current level.',
    ruleType: 'PROMOTION',
    parameters: { notionalIncrementsInOldLevel: 1, stepMethod: 'EQUAL_OR_NEXT_HIGHER' },
    isActive: true
  },
  {
    ruleId: 104,
    commissionId: 7,
    ruleCode: 'ROUNDING_CONVENTION',
    ruleName: 'Rounding to Nearest Multiple of 100',
    ruleDescription: 'Calculated pay values are rounded to the nearest multiple of Rs. 100 as per Pay Commission guidelines.',
    ruleType: 'ROUNDING',
    parameters: { multiple: 100, roundMode: 'NEAREST' },
    isActive: true
  },
  {
    ruleId: 105,
    commissionId: 7,
    ruleCode: 'DA_RATE_CURRENT',
    ruleName: 'Dearness Allowance Rate (Operative)',
    ruleDescription: 'Current applicable DA percentage calculated on revised Basic Pay.',
    ruleType: 'ALLOWANCE',
    parameters: { ratePercentage: 50 },
    isActive: true
  },
  {
    ruleId: 106,
    commissionId: 7,
    ruleCode: 'HRA_CLASSIFICATION',
    ruleName: 'House Rent Allowance Slabs (X/Y/Z Cities)',
    ruleDescription: 'Tiered HRA based on city classification: X (Class A) = 30%, Y = 20%, Z = 10% (revised when DA crossed 50%).',
    ruleType: 'ALLOWANCE',
    parameters: { X: 30, Y: 20, Z: 10 },
    isActive: true
  }
];

export const INITIAL_DEPARTMENTS = [
  { id: 1, name: 'Administration & HR', code: 'ADM' },
  { id: 2, name: 'Finance & Accounts', code: 'FIN' },
  { id: 3, name: 'Information Technology', code: 'IT' },
  { id: 4, name: 'Legal & Vigilance', code: 'LEG' },
  { id: 5, name: 'Planning & Statistics', code: 'PLN' }
];

export const INITIAL_DESIGNATIONS = [
  { id: 1, name: 'Multi-Tasking Staff (MTS)', defaultLevel: '1' },
  { id: 2, name: 'Lower Division Clerk (LDC)', defaultLevel: '2' },
  { id: 3, name: 'Upper Division Clerk (UDC)', defaultLevel: '4' },
  { id: 4, name: 'Assistant Section Officer (ASO)', defaultLevel: '7' },
  { id: 5, name: 'Section Officer (SO)', defaultLevel: '8' },
  { id: 6, name: 'Under Secretary (US)', defaultLevel: '11' },
  { id: 7, name: 'Deputy Secretary (DS)', defaultLevel: '12' },
  { id: 8, name: 'Director', defaultLevel: '13' },
  { id: 9, name: 'Joint Secretary', defaultLevel: '14' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    employeeId: 1001,
    employeeCode: 'EMP-001',
    employeeName: 'Rajesh Kumar Sharma',
    fathersHusbandsName: 'Ram Avatar Sharma',
    gender: 'MALE',
    dateOfBirth: '1982-05-14',
    dateOfJoining: '2008-08-11',
    departmentId: 1,
    departmentName: 'Administration & HR',
    designationId: 4,
    designationName: 'Assistant Section Officer (ASO)',
    cityCategory: 'X',
    currentCommissionId: 7,
    levelNumber: '7',
    currentPayCell: 6,
    basicPay: 52000,
    incrementDate: '01-07-2026',
    panNumber: 'ABCPS1234F',
    mobileNumber: '+91 98112 34567',
    email: 'rajesh.sharma@gov.in',
    status: 'ACTIVE'
  },
  {
    employeeId: 1002,
    employeeCode: 'EMP-002',
    employeeName: 'Priya Sundaram',
    fathersHusbandsName: 'K. Sundaram',
    gender: 'FEMALE',
    dateOfBirth: '1987-11-20',
    dateOfJoining: '2012-03-15',
    departmentId: 2,
    departmentName: 'Finance & Accounts',
    designationId: 5,
    designationName: 'Section Officer (SO)',
    cityCategory: 'X',
    currentCommissionId: 7,
    levelNumber: '8',
    currentPayCell: 4,
    basicPay: 52000,
    incrementDate: '01-01-2027',
    panNumber: 'BKLPS9876K',
    mobileNumber: '+91 98450 12890',
    email: 'priya.sundaram@gov.in',
    status: 'ACTIVE'
  },
  {
    employeeId: 1003,
    employeeCode: 'EMP-003',
    employeeName: 'Amit Vikram Singh',
    fathersHusbandsName: 'Col. D. S. Singh',
    gender: 'MALE',
    dateOfBirth: '1975-02-18',
    dateOfJoining: '2001-09-03',
    departmentId: 1,
    departmentName: 'Administration & HR',
    designationId: 7,
    designationName: 'Deputy Secretary (DS)',
    cityCategory: 'X',
    currentCommissionId: 7,
    levelNumber: '12',
    currentPayCell: 7,
    basicPay: 94100,
    incrementDate: '01-07-2026',
    panNumber: 'CDXPS4567M',
    mobileNumber: '+91 99100 88221',
    email: 'amit.singh@gov.in',
    status: 'ACTIVE'
  },
  {
    employeeId: 1004,
    employeeCode: 'EMP-004',
    employeeName: 'Sunita Meena',
    fathersHusbandsName: 'Harish Meena',
    gender: 'FEMALE',
    dateOfBirth: '1993-07-08',
    dateOfJoining: '2019-10-24',
    departmentId: 3,
    departmentName: 'Information Technology',
    designationId: 3,
    designationName: 'Upper Division Clerk (UDC)',
    cityCategory: 'Y',
    currentCommissionId: 7,
    levelNumber: '4',
    currentPayCell: 5,
    basicPay: 28700,
    incrementDate: '01-07-2026',
    panNumber: 'DFGPS3321N',
    mobileNumber: '+91 97118 44550',
    email: 'sunita.meena@gov.in',
    status: 'ACTIVE'
  },
  {
    employeeId: 1005,
    employeeCode: 'EMP-005',
    employeeName: 'Manish Verma',
    fathersHusbandsName: 'Satish Verma',
    gender: 'MALE',
    dateOfBirth: '1996-04-12',
    dateOfJoining: '2021-02-01',
    departmentId: 1,
    departmentName: 'Administration & HR',
    designationId: 1,
    designationName: 'Multi-Tasking Staff (MTS)',
    cityCategory: 'Z',
    currentCommissionId: 7,
    levelNumber: '1',
    currentPayCell: 4,
    basicPay: 19700,
    incrementDate: '01-01-2027',
    panNumber: 'EHYPS8811P',
    mobileNumber: '+91 94220 55112',
    email: 'manish.verma@gov.in',
    status: 'ACTIVE'
  },
  {
    employeeId: 1006,
    employeeCode: 'EMP-006',
    employeeName: 'Dr. Arvinder Singh Gill',
    fathersHusbandsName: 'Dr. T. S. Gill',
    gender: 'MALE',
    dateOfBirth: '1970-08-30',
    dateOfJoining: '1998-04-15',
    departmentId: 5,
    departmentName: 'Planning & Statistics',
    designationId: 9,
    designationName: 'Joint Secretary',
    cityCategory: 'X',
    currentCommissionId: 7,
    levelNumber: '14',
    currentPayCell: 9,
    basicPay: 182700,
    incrementDate: '01-07-2026',
    panNumber: 'FZKPS9933R',
    mobileNumber: '+91 98101 23499',
    email: 'as.gill@gov.in',
    status: 'ACTIVE'
  }
];

export const INITIAL_FIXATIONS: PayFixationRecord[] = [
  {
    fixationId: 501,
    employeeId: 1001,
    employeeCode: 'EMP-001',
    employeeName: 'Rajesh Kumar Sharma',
    departmentName: 'Administration & HR',
    designationName: 'Section Officer (SO)',
    fixationType: 'PROMOTION',
    effectiveDate: '2026-04-01',
    orderNumber: 'EST/PAY-FIX/2026/042',
    orderDate: '2026-04-05',
    commissionId: 7,
    commissionName: '7th Central Pay Commission',
    previousLevel: '7',
    previousCell: 6,
    previousBasicPay: 52000,
    newLevel: '8',
    newCell: 5,
    newBasicPay: 53600,
    daAmount: 26800,
    hraAmount: 16080,
    taAmount: 7200,
    grossPay: 103680,
    approvalStatus: 'APPROVED',
    submittedBy: 'Dealing Assistant (Sh. R. Patel)',
    submittedAt: '2026-04-06 11:30',
    approvedBy: 'DDO / Accounts Officer (Sh. V. Joshi)',
    approvedAt: '2026-04-08 14:15',
    approvalRemarks: 'Promotional fixation under FR 22(I)(a)(1) verified with Service Book Vol II, Page 45.',
    nextIncrementDate: '01-01-2027',
    createdAt: '2026-04-05',
    calculationSteps: [
      {
        stepNumber: 1,
        title: 'Current Pay Baseline in Substantive Level',
        description: 'Existing pay verified from LPC / Service Record in Level 7.',
        formula: 'Level 7, Cell 6',
        inputValue: '₹52,000',
        outputValue: '₹52,000'
      },
      {
        stepNumber: 2,
        title: 'Notional Increment in Feeder Level',
        description: 'Under FR 22(I)(a)(1), grant one notional vertical increment in feeder Level 7 (advance to Cell 7).',
        formula: 'Level 7 Cell 6 -> Cell 7',
        inputValue: '₹52,000',
        outputValue: '₹53,600',
        notes: 'Notional figure calculated for comparison purpose.'
      },
      {
        stepNumber: 3,
        title: 'Fitment into Promotional Level Matrix',
        description: 'Locate promotional Level 8. Search for figure equal to ₹53,600; if not present, next higher cell.',
        formula: 'Match ₹53,600 in Level 8 -> Exact match found at Cell 5',
        inputValue: '₹53,600',
        outputValue: '₹53,600 (Level 8, Cell 5)'
      },
      {
        stepNumber: 4,
        title: 'Determination of Next Annual Increment',
        description: 'As promotion took effect on 01-04-2026, qualifying service of 6 months completes on 31-12-2026.',
        formula: 'Next Increment Cycle',
        outputValue: '01-01-2027'
      }
    ]
  },
  {
    fixationId: 502,
    employeeId: 1002,
    employeeCode: 'EMP-002',
    employeeName: 'Priya Sundaram',
    departmentName: 'Finance & Accounts',
    designationName: 'Section Officer (SO)',
    fixationType: 'INCREMENT',
    effectiveDate: '2026-07-01',
    orderNumber: 'FIN/INC/2026/089',
    orderDate: '2026-06-25',
    commissionId: 7,
    commissionName: '7th Central Pay Commission',
    previousLevel: '8',
    previousCell: 4,
    previousBasicPay: 50500,
    newLevel: '8',
    newCell: 5,
    newBasicPay: 52000,
    daAmount: 26000,
    hraAmount: 15600,
    taAmount: 7200,
    grossPay: 100800,
    approvalStatus: 'SUBMITTED',
    submittedBy: 'Bill Clerk (Smt. Ananya Das)',
    submittedAt: '2026-06-26 10:15',
    approvalRemarks: 'Awaiting final scrutiny by DDO.',
    nextIncrementDate: '01-07-2027',
    createdAt: '2026-06-25',
    calculationSteps: [
      {
        stepNumber: 1,
        title: 'Annual Increment Eligibility Check',
        description: 'Employee completed 12 months continuous service in Level 8, Cell 4.',
        formula: 'Status Check: Active & No Penalty in force',
        inputValue: 'Level 8, Cell 4 (₹50,500)',
        outputValue: 'Eligible'
      },
      {
        stepNumber: 2,
        title: 'Vertical Advancement in Operative Level',
        description: 'Progress exactly one cell vertically downwards in Level 8 from Cell 4 to Cell 5.',
        formula: 'Cell 4 -> Cell 5',
        inputValue: '₹50,500',
        outputValue: '₹52,000'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    timestamp: '2026-04-08 14:15:22',
    username: 'v.joshi (DDO)',
    action: 'APPROVE_PAY_FIXATION',
    module: 'Pay Fixation',
    description: 'Approved Promotional Pay Fixation Order #EST/PAY-FIX/2026/042 for EMP-001 (Rajesh Kumar Sharma) from ₹52,000 to ₹53,600.'
  },
  {
    id: 2,
    timestamp: '2026-04-06 11:30:10',
    username: 'r.patel (Dealing Hand)',
    action: 'SUBMIT_PAY_FIXATION',
    module: 'Pay Fixation',
    description: 'Submitted draft calculation for promotion fixation of EMP-001 for DDO approval.'
  },
  {
    id: 3,
    timestamp: '2026-04-05 16:20:00',
    username: 'r.patel (Dealing Hand)',
    action: 'CALCULATE_PAY_FIXATION',
    module: 'Rules Engine',
    description: 'Executed transparent Pay Fixation calculation for EMP-001 using Rule FR 22(I)(a)(1).'
  },
  {
    id: 4,
    timestamp: '2026-01-10 09:45:00',
    username: 'system_admin',
    action: 'UPDATE_COMMISSION_RULE',
    module: 'Commission Engine',
    description: 'Updated Dearness Allowance (DA) rate rule to 50% with revised HRA threshold (X: 30%, Y: 20%, Z: 10%).'
  }
];
