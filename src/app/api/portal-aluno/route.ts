import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    xp: 0,
    current_streak: 12,
    streak: 27,
    levelGoal: "B2",
    moduloFinancial: 4,
    classroomCore: "0.0",
    financialValue: 0
  })
}
