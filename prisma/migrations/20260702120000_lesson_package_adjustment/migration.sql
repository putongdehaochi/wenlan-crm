-- Allow negative quantities for lesson balance adjustments (purchase remains > 0 in app validation)
ALTER TABLE "lesson_packages" DROP CONSTRAINT IF EXISTS "lesson_packages_quantity_positive";
ALTER TABLE "lesson_packages" ADD CONSTRAINT "lesson_packages_quantity_nonzero" CHECK ("quantity" <> 0);
