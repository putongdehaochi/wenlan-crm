/**
 * @file m1-student-repository.test.mts
 * @feature students
 * @purpose M1 数据层自测：Student Repository 四方法 + Entity 形状校验
 *
 * 运行：npm run test:m1
 * 依赖：DATABASE_URL 指向可连通的 PostgreSQL，且已执行 db:migrate
 */

import "dotenv/config"

import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_test__"

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function assertEntityShape(entity: unknown): void {
  assert(typeof entity === "object" && entity !== null, "entity is object")
  const e = entity as Record<string, unknown>
  assert(typeof e.id === "string", "id is string")
  assert(typeof e.name === "string", "name is string")
  assert(typeof e.contactName === "string", "contactName is string")
  assert(e.phone === null || typeof e.phone === "string", "phone is string|null")
  assert(e.note === null || typeof e.note === "string", "note is string|null")
  assert(e.status === "ACTIVE" || e.status === "ARCHIVED", "status enum")
  assert(e.createdAt instanceof Date, "createdAt is Date")
  assert(e.updatedAt instanceof Date, "updatedAt is Date")
  assert(!("lessonBalance" in e), "entity must not contain lessonBalance")
}

async function cleanup(): Promise<void> {
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M1 Student Repository — self test\n")

  await cleanup()

  // create
  const created = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: "13800000001",
    note: null,
  })
  assertEntityShape(created)
  assert(created.status === "ACTIVE", "create defaults to ACTIVE")
  console.log("✓ create → StudentEntity")

  // existsByNameAndContact
  const exists = await studentRepository.existsByNameAndContact(
    `${TEST_PREFIX}小明`,
    "明妈"
  )
  assert(exists === true, "existsByNameAndContact returns true")
  console.log("✓ existsByNameAndContact (true)")

  const notExists = await studentRepository.existsByNameAndContact(
    `${TEST_PREFIX}小明`,
    "不存在"
  )
  assert(notExists === false, "existsByNameAndContact returns false")
  console.log("✓ existsByNameAndContact (false)")

  // findById
  const found = await studentRepository.findById(created.id)
  assert(found !== null, "findById returns entity")
  assertEntityShape(found)
  assert(found!.name === `${TEST_PREFIX}小明`, "findById name match")
  console.log("✓ findById")

  // findAllActive
  await studentRepository.create({
    name: `${TEST_PREFIX}小红`,
    contactName: "红爸",
    phone: null,
    note: "无电话",
  })

  const list = await studentRepository.findAllActive()
  const testRows = list.filter((s) => s.name.startsWith(TEST_PREFIX))
  assert(testRows.length >= 2, "findAllActive includes test rows")
  testRows.forEach(assertEntityShape)
  assert(
    testRows.every((s) => s.status === "ACTIVE"),
    "findAllActive only ACTIVE"
  )
  console.log("✓ findAllActive (ACTIVE only, Entity shape)")

  // unique constraint: same name + contactName
  let duplicateBlocked = false
  try {
    await studentRepository.create({
      name: `${TEST_PREFIX}小明`,
      contactName: "明妈",
      phone: null,
      note: null,
    })
  } catch {
    duplicateBlocked = true
  }
  assert(duplicateBlocked, "duplicate name+contactName rejected by DB")
  console.log("✓ unique constraint (name + contactName)")

  await cleanup()
  console.log("\nAll M1 repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
