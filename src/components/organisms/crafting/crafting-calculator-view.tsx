"use client";

import { Alert, InputNumber, Select } from "antd";
import { useState } from "react";

import { Button } from "@/components/atoms";
import type { CraftingBatchCalculation, CraftingRecipes } from "@/services/crafting";
import { craftingBatchCalculationSchema, craftingBatchRequestSchema } from "@/services/crafting";

type Props = Readonly<{ initialData: CraftingRecipes | null }>;
type RecipeInput = { id: number; weapon_code: string; quantity: number };

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", remainingSeconds ? `${remainingSeconds}s` : ""]
    .filter(Boolean)
    .join(" ");
}

export function CraftingCalculatorView({ initialData }: Props) {
  const recipes = initialData?.recipes ?? [];
  const [inputs, setInputs] = useState<RecipeInput[]>([
    { id: 1, weapon_code: recipes[0]?.weapon_code ?? "", quantity: 1 },
  ]);
  const [nextInputID, setNextInputID] = useState(2);
  const [calculation, setCalculation] = useState<CraftingBatchCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }

  function addInput() {
    const selected = new Set(inputs.map((input) => input.weapon_code));
    const nextRecipe = recipes.find((recipe) => !selected.has(recipe.weapon_code));
    if (!nextRecipe) return;
    setInputs((current) => [...current, { id: nextInputID, weapon_code: nextRecipe.weapon_code, quantity: 1 }]);
    setNextInputID((current) => current + 1);
    setCalculation(null);
  }

  function removeInput(id: number) {
    setInputs((current) => current.filter((input) => input.id !== id));
    setCalculation(null);
  }

  if (!initialData)
    return <Alert className="mt-7" type="error" showIcon title="Crafting recipes could not be loaded." />;

  return (
    <div className="mt-5 grid gap-3">
      <div aria-live="polite">{error ? <Alert type="error" showIcon title={error} /> : null}</div>

      <section className="grid overflow-hidden border border-[var(--color-border)] bg-[rgba(242,182,61,.025)] lg:grid-cols-[330px_minmax(0,1fr)]">
        <div className="grid content-start gap-4 border-b border-[var(--color-border)] p-4 lg:border-r lg:border-b-0">
          <div>
            <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
              Recipe input
            </p>
            <h2 className="mt-1 font-[Impact] text-xl font-normal uppercase">Weapon quantities</h2>
          </div>
          <div className="grid max-h-[390px] gap-2 overflow-y-auto pr-1">
            {inputs.map((input, index) => {
              const selectedByOthers = new Set(
                inputs.filter((candidate) => candidate.id !== input.id).map((candidate) => candidate.weapon_code),
              );
              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_76px_28px] items-end gap-2 border border-[var(--color-border)] bg-[rgba(7,6,5,.45)] p-2"
                  key={input.id}
                >
                  <label className="grid min-w-0 gap-1">
                    <span className="text-[9px] font-extrabold tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
                      Weapon {index + 1}
                    </span>
                    <Select
                      aria-label={`Weapon ${index + 1}`}
                      className="h-9"
                      value={input.weapon_code || undefined}
                      options={recipes.map((recipe) => ({
                        label: recipe.weapon_name,
                        value: recipe.weapon_code,
                        disabled: selectedByOthers.has(recipe.weapon_code),
                      }))}
                      onChange={(value) => updateInput(input.id, { weapon_code: value })}
                      placeholder="Weapon"
                      showSearch
                      optionFilterProp="label"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[9px] font-extrabold tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
                      Qty
                    </span>
                    <InputNumber
                      aria-label={`Quantity ${index + 1}`}
                      className="h-9 w-full"
                      min={1}
                      max={10_000}
                      precision={0}
                      value={input.quantity}
                      onChange={(value) => updateInput(input.id, { quantity: value ?? 1 })}
                    />
                  </label>
                  <button
                    aria-label={`Remove weapon ${index + 1}`}
                    className="grid h-9 w-7 place-items-center border border-[var(--color-border)] bg-transparent text-lg text-[var(--color-foreground-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={inputs.length === 1}
                    onClick={() => removeInput(input.id)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <Button
            className="h-9 w-full border-dashed text-xs font-extrabold uppercase"
            intent="secondary"
            disabled={inputs.length >= recipes.length || inputs.length >= 20}
            onClick={addInput}
          >
            + Add recipe
          </Button>
          <Button
            className="mt-1 h-10 w-full font-extrabold uppercase"
            loading={calculating}
            disabled={calculating || inputs.some((input) => !input.weapon_code)}
            onClick={calculate}
          >
            Calculate
          </Button>
        </div>

        {calculation ? (
          <div className="min-w-0">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                  Required materials
                </p>
                <h2 className="mt-0.5 truncate font-[Impact] text-2xl font-normal uppercase">Combined materials</h2>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-5 text-right">
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    Weapons
                  </p>
                  <strong className="text-sm">{calculation.total_requested_quantity}</strong>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    Crafts
                  </p>
                  <strong className="text-sm">{calculation.total_craft_count}</strong>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                    Time
                  </p>
                  <strong className="text-sm">{formatDuration(calculation.total_crafting_time_seconds)}</strong>
                </div>
              </div>
            </div>
            <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
              {calculation.ingredients.map((ingredient, index) => (
                <article
                  className="relative min-h-24 overflow-hidden border border-[var(--color-border)] bg-[rgba(7,6,5,.7)] px-3 py-2.5"
                  key={`${ingredient.item_code}:${ingredient.item_name}`}
                >
                  <span className="absolute top-2 right-2.5 text-[10px] font-black text-[rgba(242,182,61,.25)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="pr-6 text-[10px] font-extrabold tracking-[.1em] text-[var(--color-foreground-muted)] uppercase">
                    {ingredient.item_name}
                  </p>
                  <p className="mt-1.5 font-[Impact] text-3xl leading-none text-[var(--color-primary-bright)]">
                    {ingredient.total_quantity.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-foreground-muted)]">All selected recipes</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center px-6 text-center text-sm text-[var(--color-foreground-muted)]">
            Select recipe and calculate to see required materials.
          </div>
        )}
      </section>
    </div>
  );
}
