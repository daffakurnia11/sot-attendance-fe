"use client";

import { Alert, Select } from "antd";
import { useState } from "react";

import { Button, ItemQuantityCard, QuantityItemRow, ResourceState, SplitPanel } from "@/components/atoms";
import { useI18n } from "@/i18n";
import type { CraftingBatchCalculation, CraftingRecipes } from "@/services/crafting";
import { craftingBatchCalculationSchema, craftingBatchRequestSchema } from "@/services/crafting";

type Props = Readonly<{ initialData: CraftingRecipes | null; isAdmin: boolean }>;
type RecipeInput = { id: number; weapon_code: string; quantity: number };

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", remainingSeconds ? `${remainingSeconds}s` : ""]
    .filter(Boolean)
    .join(" ");
}

export function CraftingCalculatorView({ initialData, isAdmin }: Props) {
  const { t, translate } = useI18n();
  const recipes = initialData?.recipes ?? [];
  const [inputs, setInputs] = useState<RecipeInput[]>([
    { id: 1, weapon_code: recipes[0]?.weapon_code ?? "", quantity: 1 },
  ]);
  const [nextInputID, setNextInputID] = useState(2);
  const [calculation, setCalculation] = useState<CraftingBatchCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSuccess, setStoreSuccess] = useState<string | null>(null);
  const [storing, setStoring] = useState(false);
  const [destination, setDestination] = useState<"public" | "boss">("boss");
  const [pendingStore, setPendingStore] = useState<{ input: string; key: string } | null>(null);

  async function calculate() {
    const input = craftingBatchRequestSchema.safeParse({
      recipes: inputs.map(({ weapon_code, quantity }) => ({ weapon_code, quantity })),
    });
    if (!input.success) {
      setError("Choose unique weapons and enter quantities between 1 and 10,000.");
      return;
    }
    setCalculating(true);
    setError(null);
    try {
      const response = await fetch("/api/crafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error("Crafting calculation could not be loaded.");
      setCalculation(craftingBatchCalculationSchema.parse(payload));
    } catch (caught) {
      setCalculation(null);
      setError(caught instanceof Error ? caught.message : "Crafting calculation could not be loaded.");
    } finally {
      setCalculating(false);
    }
  }

  function updateInput(id: number, values: Partial<Omit<RecipeInput, "id">>) {
    setInputs((current) => current.map((input) => (input.id === id ? { ...input, ...values } : input)));
    setCalculation(null);
    setStoreSuccess(null);
    setPendingStore(null);
  }

  function addInput() {
    const selected = new Set(inputs.map((input) => input.weapon_code));
    const nextRecipe = recipes.find((recipe) => !selected.has(recipe.weapon_code));
    if (!nextRecipe) return;
    setInputs((current) => [...current, { id: nextInputID, weapon_code: nextRecipe.weapon_code, quantity: 1 }]);
    setNextInputID((current) => current + 1);
    setCalculation(null);
    setStoreSuccess(null);
    setPendingStore(null);
  }

  function removeInput(id: number) {
    setInputs((current) => current.filter((input) => input.id !== id));
    setCalculation(null);
    setStoreSuccess(null);
    setPendingStore(null);
  }

  async function storeStock() {
    if (!calculation || calculation.ingredients.some((ingredient) => ingredient.missing_quantity > 0)) return;
    const request = { recipes: inputs.map(({ weapon_code, quantity }) => ({ weapon_code, quantity })), destination };
    const input = JSON.stringify(request);
    const key = pendingStore?.input === input ? pendingStore.key : crypto.randomUUID();
    setPendingStore({ input, key });
    setStoring(true);
    setError(null);
    try {
      const response = await fetch("/api/crafting/store-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, idempotency_key: key }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        throw new Error(
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Crafting stock could not be stored.",
        );
      }
      setPendingStore(null);
      setStoreSuccess("Crafting stock stored successfully.");
      await calculate();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Crafting stock could not be stored.");
    } finally {
      setStoring(false);
    }
  }

  if (!initialData) return <ResourceState state="unavailable" message="Crafting recipes could not be loaded." />;

  return (
    <div className="mt-5 grid gap-3">
      <div aria-live="polite">
        {error ? <Alert type="error" showIcon title={translate(error)} /> : null}
        {storeSuccess ? <Alert type="success" showIcon title={translate(storeSuccess)} /> : null}
      </div>

      <SplitPanel
        sidebar={
          <>
            <div>
              <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                {translate("Recipe input")}
              </p>
              <h2 className="mt-1 font-display text-xl font-normal uppercase">{translate("Weapon quantities")}</h2>
            </div>
            <div className="grid max-h-[390px] gap-2 overflow-y-auto pr-1">
              {inputs.map((input, index) => {
                const selectedByOthers = new Set(
                  inputs.filter((candidate) => candidate.id !== input.id).map((candidate) => candidate.weapon_code),
                );
                return (
                  <QuantityItemRow
                    label={t("Weapon {number}", { number: index + 1 })}
                    key={input.id}
                    value={input.weapon_code}
                    quantity={input.quantity}
                    options={recipes.map((recipe) => ({
                      label: recipe.weapon_name,
                      value: recipe.weapon_code,
                      disabled: selectedByOthers.has(recipe.weapon_code),
                    }))}
                    onItemChange={(weapon_code) => updateInput(input.id, { weapon_code })}
                    onQuantityChange={(quantity) => updateInput(input.id, { quantity })}
                    onRemove={() => removeInput(input.id)}
                    removeDisabled={inputs.length === 1}
                    disabled={calculating}
                  />
                );
              })}
            </div>
            <Button
              className="h-9 w-full border-dashed text-xs font-extrabold uppercase"
              intent="secondary"
              disabled={calculating || inputs.length >= recipes.length || inputs.length >= 20}
              onClick={addInput}
            >
              {translate("+ Add recipe")}
            </Button>
            <Button
              className="mt-1 h-10 w-full font-extrabold uppercase"
              loading={calculating}
              disabled={calculating || inputs.some((input) => !input.weapon_code)}
              onClick={calculate}
            >
              {translate("Calculate")}
            </Button>
            {isAdmin && calculation ? (
              <div className="grid gap-2 border-t border-[var(--color-border)] pt-4">
                <Select
                  aria-label={t("Crafted weapon destination")}
                  disabled={storing}
                  onChange={(value) => {
                    setDestination(value);
                    setPendingStore(null);
                  }}
                  options={[
                    { label: t("Public Stash"), value: "public" },
                    { label: t("Boss Stash"), value: "boss" },
                  ]}
                  value={destination}
                />
                <Button
                  disabled={storing || calculation.ingredients.some((ingredient) => ingredient.missing_quantity > 0)}
                  loading={storing}
                  onClick={storeStock}
                >
                  {translate("Store Stock")}
                </Button>
              </div>
            ) : null}
          </>
        }
      >
        {calculation ? (
          <div className="min-w-0">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                  {translate("Required materials")}
                </p>
                <h2 className="mt-0.5 truncate font-display text-2xl font-normal uppercase">
                  {translate("Combined materials")}
                </h2>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-5 text-right">
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    {translate("Weapons")}
                  </p>
                  <strong className="text-sm">{calculation.total_requested_quantity}</strong>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    {translate("Crafts")}
                  </p>
                  <strong className="text-sm">{calculation.total_craft_count}</strong>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    {translate("Time")}
                  </p>
                  <strong className="text-sm">{formatDuration(calculation.total_crafting_time_seconds)}</strong>
                </div>
              </div>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
              {calculation.ingredients.map((ingredient, index) => (
                <ItemQuantityCard
                  key={`${ingredient.item_code}:${ingredient.item_name}`}
                  index={index + 1}
                  name={ingredient.item_name}
                  quantity={ingredient.total_quantity}
                  quantityIntent={ingredient.missing_quantity > 0 ? "danger" : "success"}
                  note="Required amount"
                  details={
                    calculation.stock_available
                      ? [
                          { label: "Public Stash", quantity: ingredient.public_quantity },
                          { label: "Boss Stash", quantity: ingredient.boss_quantity },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center px-6 text-center text-sm text-[var(--color-foreground-muted)]">
            {translate("Select recipe and calculate to see required materials.")}
          </div>
        )}
      </SplitPanel>
    </div>
  );
}
