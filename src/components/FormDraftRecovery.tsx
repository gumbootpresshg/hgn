"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

type DraftValue = { key: string; kind: "value" | "checked"; value: string | boolean }
type FormDraft = { savedAt: string; values: DraftValue[] }

const eligible = (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
  if ((field as HTMLInputElement).disabled) return false
  if (field.closest("[data-hgn-draft-ignore]")) return false
  if (field instanceof HTMLInputElement && ["button", "submit", "reset", "file", "image", "password", "hidden"].includes(field.type)) return false
  return true
}

function fieldKey(form: HTMLFormElement, field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, index: number) {
  return field.name || field.id || `field-${Array.from(form.elements).indexOf(field)}-${index}`
}

function snapshot(form: HTMLFormElement): FormDraft {
  const values: DraftValue[] = []
  Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")).forEach((field, index) => {
    if (!eligible(field)) return
    const key = fieldKey(form, field, index)
    if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) values.push({ key, kind: "checked", value: field.checked })
    else values.push({ key, kind: "value", value: field.value })
  })
  return { savedAt: new Date().toISOString(), values }
}

function nativeValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = field instanceof HTMLInputElement ? HTMLInputElement.prototype : field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLSelectElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set
  setter?.call(field, value)
  field.dispatchEvent(new Event("input", { bubbles: true }))
  field.dispatchEvent(new Event("change", { bubbles: true }))
}

function restore(form: HTMLFormElement, draft: FormDraft) {
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"))
  draft.values.forEach((saved) => {
    const index = fields.findIndex((field, position) => fieldKey(form, field, position) === saved.key)
    const field = fields[index]
    if (!field || !eligible(field)) return
    if (saved.kind === "checked" && field instanceof HTMLInputElement) {
      field.checked = Boolean(saved.value)
      field.dispatchEvent(new Event("change", { bubbles: true }))
    } else if (saved.kind === "value") nativeValue(field, String(saved.value))
  })
}

export default function FormDraftRecovery() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    const key = `hgn:tab-form-recovery:${pathname}?${search.toString()}`
    const forms = () => Array.from(document.querySelectorAll<HTMLFormElement>("form:not([data-hgn-draft-ignore])"))
    const save = () => {
      try { sessionStorage.setItem(key, JSON.stringify(forms().map(snapshot))) } catch {}
    }
    const restoreSaved = () => {
      try {
        const raw = sessionStorage.getItem(key)
        if (!raw) return
        const drafts = JSON.parse(raw) as FormDraft[]
        forms().forEach((form, index) => { if (drafts[index]?.values?.length) restore(form, drafts[index]) })
      } catch {}
    }
    // Some editors finish rendering after the page shell. Reapply briefly after hydration.
    restoreSaved()
    const first = window.setTimeout(restoreSaved, 250)
    const second = window.setTimeout(restoreSaved, 900)
    const saveWhenHidden = () => { if (document.visibilityState === "hidden") save() }
    document.addEventListener("input", save, true)
    document.addEventListener("change", save, true)
    window.addEventListener("pagehide", save)
    document.addEventListener("visibilitychange", saveWhenHidden)
    return () => {
      window.clearTimeout(first); window.clearTimeout(second)
      document.removeEventListener("input", save, true)
      document.removeEventListener("change", save, true)
      window.removeEventListener("pagehide", save)
      document.removeEventListener("visibilitychange", saveWhenHidden)
    }
  }, [pathname, search])
  return null
}
