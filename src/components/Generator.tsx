import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Download, FileText, Copy, Check, RotateCcw } from 'lucide-react'
import type { FormState, GeneratedOutputs, TemplateType } from '../App'
import { useState } from 'react'
import { slugify } from '../lib/slug'
import { validateForm } from '../lib/validation'

interface GeneratorProps {
  form: FormState
  update: (patch: Partial<FormState>) => void
  reset: () => void
  outputs: GeneratedOutputs
  types: { value: TemplateType; label: string; desc: string }[]
}

const EASE = [0.16, 1, 0.3, 1] as const

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function CodeBlock({ title, content, filename }: { title: string; content: string; filename: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const ta = document.createElement('textarea')
        ta.value = content
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('copy failed', err)
      try {
        const ta = document.createElement('textarea')
        ta.value = content
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('clipboard fallback failed', fallbackErr)
      }
    }
  }

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-xs text-gray-400 font-mono">{filename}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => downloadFile(content, filename)}
            className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto"><code>{content}</code></pre>
    </div>
  )
}

const INPUT_CLASS = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gray-500/50 focus:bg-white/[0.07] transition-all"

export function Generator({ form, update, reset, outputs, types }: GeneratorProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errors = validateForm(form)
  const hasErrors = Object.keys(errors).length > 0

  return (
    <section id="generator" ref={ref} className="py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="text-[#6366f1] text-xs font-medium tracking-widest uppercase">Generator</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-100 mt-3 leading-tight">
            Build your issue template
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            Choose a template type, customize it, then preview and download.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form — 2 cols */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ x: -20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            {/* Template type selector */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <label className="block text-xs text-gray-400 font-medium">Template Type</label>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-gray-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {types.map(t => (
                  <button
                    key={t.value}
                    onClick={() => update({ type: t.value })}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${
                      form.type === t.value
                        ? 'border-[#6366f1] bg-[#6366f1]/10 text-gray-200'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-medium block">{t.label}</span>
                    <span className="text-[10px] opacity-60 mt-0.5 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project name */}
            <div>
              <label htmlFor="projectName" className="block text-xs text-gray-400 font-medium mb-2">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={form.projectName}
                onChange={e => update({ projectName: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, projectName: true }))}
                placeholder="e.g. my-awesome-lib"
                className={INPUT_CLASS}
                aria-invalid={Boolean(errors.projectName)}
              />
              {touched.projectName && errors.projectName && (
                <p className="mt-1 text-xs text-red-400" role="alert">{errors.projectName}</p>
              )}
            </div>

            {/* Repo URL */}
            <div>
              <label htmlFor="repoUrl" className="block text-xs text-gray-400 font-medium mb-2">
                Repository URL <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="repoUrl"
                type="text"
                value={form.repoUrl}
                onChange={e => update({ repoUrl: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, repoUrl: true }))}
                placeholder="https://github.com/user/repo"
                className={INPUT_CLASS}
                aria-invalid={Boolean(errors.repoUrl)}
              />
              {touched.repoUrl && errors.repoUrl && (
                <p className="mt-1 text-xs text-red-400" role="alert">{errors.repoUrl}</p>
              )}
            </div>

            {/* Additional fields */}
            <div>
              <label htmlFor="additionalFields" className="block text-xs text-gray-400 font-medium mb-2">
                Custom Sections <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                id="additionalFields"
                value={form.additionalFields}
                onChange={e => update({ additionalFields: e.target.value })}
                placeholder="Add extra markdown sections to include..."
                rows={4}
                maxLength={5000}
                className={`${INPUT_CLASS} resize-none`}
                aria-invalid={Boolean(errors.additionalFields)}
              />
              {errors.additionalFields ? (
                <p className="mt-1 text-xs text-red-400" role="alert">{errors.additionalFields}</p>
              ) : (
                <p className="mt-1 text-[10px] text-gray-600">{form.additionalFields.length}/5000</p>
              )}
            </div>
          </motion.div>

          {/* Preview — 3 cols */}
          <motion.div
            className="lg:col-span-3 space-y-4"
            initial={{ x: 20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Live Preview</span>
            </div>

            <CodeBlock
              title="Issue Template"
              content={outputs.markdown}
              filename={form.projectName ? `${slugify(form.projectName)}-${form.type}.md` : `ISSUE_TEMPLATE.md`}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <CodeBlock
                title="Config"
                content={outputs.config}
                filename="config.yml"
              />
              <CodeBlock
                title="Triage Checklist"
                content={outputs.checklist}
                filename={form.projectName ? `triage-checklist-${slugify(form.projectName)}.md` : `triage-checklist.md`}
              />
            </div>

            {/* Bulk download */}
            <div className="flex flex-col items-end gap-1.5 pt-2">
              <button
                onClick={() => {
                  setTouched({ projectName: true, repoUrl: true })
                  if (hasErrors) return
                  const slug = form.projectName ? slugify(form.projectName) : 'triagekit'
                  downloadFile(outputs.markdown, `${slug}-${form.type}.md`)
                  downloadFile(outputs.config, `${slug}-config.yml`)
                  downloadFile(outputs.checklist, `${slug}-checklist.md`)
                }}
                disabled={hasErrors}
                title={hasErrors ? 'Fix the highlighted fields first' : undefined}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#5457e5] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              {hasErrors && (
                <span className="text-[10px] text-gray-500">Fix the highlighted fields to enable download.</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
