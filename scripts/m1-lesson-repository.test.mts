/**
 * @file m1-lesson-repository.test.mts
 * @feature lessons
 * @purpose M1 数据层自测：LessonPackage + LessonBalance Repository 职责分离
 *
 * 运行：npm run test:m1-lesson
 */

import "dotenv/config"

import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_lesson__"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function assertPackageEntityShape(entity: unknown): void {
  assert(typeof entity === "object" && entity !== null, "entity is object")
  const e = entity as Record<string, unknown>
  assert(typeof e.id === "string", "id is string")
  assert(typeof e.studentId === "string", "studentId is string")
  assert(typeof e.quantity === "number", "quantity is number")
  assert(e.note === null || typeof e.note === "string", "note is string|null")
  assert(e.purchasedAt instanceof Date, "purchasedAt is Date")
  assert(e.createdAt instanceof Date, "createdAt is Date")
  assert(!("lessonBalance" in e), "entity must not contain lessonBalance")
}

async function cleanup(): Promise<void> {
  await prisma.lessonPackage.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M1 Lesson Repository — self test\n")
  await cleanup()

  const studentA = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: null,
    note: null,
  })
  const studentB = await studentRepository.create({
    name: `${TEST_PREFIX}小红`,
    contactName: "红爸",
    phone: null,
    note: null,
  })

  // lessonPackageRepository.create
  const pkg1 = await lessonPackageRepository.create({
    studentId: studentA.id,
    quantity: 10,
    note: "首次购课",
  })
  assertPackageEntityShape(pkg1)
  assert(pkg1.quantity === 10, "create quantity")
  console.log("✓ lessonPackageRepository.create")

  // lessonPackageRepository.findByStudentId
  const packages = await lessonPackageRepository.findByStudentId(studentA.id)
  assert(packages.length === 1, "findByStudentId count")
  assertPackageEntityShape(packages[0])
  console.log("✓ lessonPackageRepository.findByStudentId")

  // package repo has no balance methods
  assert(
    !("getBalance" in lessonPackageRepository),
    "package repo must not expose getBalance"
  )
  assert(
    !("getBalances" in lessonPackageRepository),
    "package repo must not expose getBalances"
  )
  console.log("✓ lessonPackageRepository has no balance methods")

  // getBalance — no packages
  const balanceB = await lessonBalanceRepository.getBalance(studentB.id)
  assert(balanceB === 0, "no packages balance is 0")
  console.log("✓ lessonBalanceRepository.getBalance (0)")

  // getBalance — after purchase
  const balanceA = await lessonBalanceRepository.getBalance(studentA.id)
  assert(balanceA === 10, "single purchase balance")
  console.log("✓ lessonBalanceRepository.getBalance (10)")

  // second purchase
  await lessonPackageRepository.create({
    studentId: studentA.id,
    quantity: 5,
    note: null,
  })
  const balanceAfter = await lessonBalanceRepository.getBalance(studentA.id)
  assert(balanceAfter === 15, "accumulated balance")
  console.log("✓ lessonBalanceRepository.getBalance (15)")

  // getBalances — batch
  await lessonPackageRepository.create({
    studentId: studentB.id,
    quantity: 3,
    note: null,
  })
  const batch = await lessonBalanceRepository.getBalances([
    studentA.id,
    studentB.id,
    "nonexistent-id",
  ])
  assert(batch.get(studentA.id) === 15, "batch balance A")
  assert(batch.get(studentB.id) === 3, "batch balance B")
  assert(batch.get("nonexistent-id") === 0, "missing id balance 0")
  console.log("✓ lessonBalanceRepository.getBalances (batch)")

  // getBalances — empty input
  const empty = await lessonBalanceRepository.getBalances([])
  assert(empty.size === 0, "empty ids returns empty map")
  console.log("✓ lessonBalanceRepository.getBalances ([])")

  // balance repo has no write methods
  assert(
    !("create" in lessonBalanceRepository),
    "balance repo must not expose create"
  )
  console.log("✓ lessonBalanceRepository has no write methods")

  // quantity must be positive (DB CHECK)
  let invalidBlocked = false
  try {
    await lessonPackageRepository.create({
      studentId: studentA.id,
      quantity: 0,
      note: null,
    })
  } catch {
    invalidBlocked = true
  }
  assert(invalidBlocked, "quantity 0 rejected by DB")
  console.log("✓ quantity CHECK constraint")

  await cleanup()
  console.log("\nAll M1 lesson repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 lesson test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
