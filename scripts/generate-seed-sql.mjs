import { writeFileSync } from 'node:fs'
import { requirements } from './requirements.mjs'

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`
}

if (requirements.length !== 36) {
  throw new Error(`Expected 36 requirements, got ${requirements.length}`)
}

const counts = { indispensavel: 0, importante: 0, desejavel: 0 }
for (const req of requirements) counts[req.priority] += 1

const values = [...requirements]
  .sort(
    (a, b) =>
      ({ indispensavel: 0, importante: 1, desejavel: 2 }[a.priority] -
        { indispensavel: 0, importante: 1, desejavel: 2 }[b.priority]) ||
      Number(a.id.slice(4)) - Number(b.id.slice(4)),
  )
  .map((req, index) => {
    const title = `${req.id} — ${req.title}`.slice(0, 200)
    const due = req.priority === 'indispensavel' ? `'2026-09-10'` : 'null'
    return `  (
    ${sqlString(title)},
    ${sqlString(req.description)},
    ${index},
    ${due},
    ARRAY[${sqlString(req.priority)}]::text[],
    'artur'
  )`
  })
  .join(',\n')

const sql = `-- Cartões do Levantamento de Requisitos (20/08/2026)
-- ${requirements.length} cards na lista "A fazer", responsável Artur.
-- Indispensáveis (${counts.indispensavel}): prazo 10/09/2026.
-- Importantes (${counts.importante}) e desejáveis (${counts.desejavel}): sem data.
-- Cole no SQL Editor do Supabase e execute.

insert into public.cards (list_id, title, description, position, due_date, labels, assigned_to)
select
  lists.id,
  seed.title,
  seed.description,
  seed.position,
  seed.due_date::date,
  seed.labels,
  seed.assigned_to
from (
  select id
  from public.board_lists
  where lower(trim(title)) = 'a fazer'
  order by created_at
  limit 1
) as lists
cross join (
  values
${values}
) as seed(title, description, position, due_date, labels, assigned_to);
`

writeFileSync(new URL('../supabase/migrations/20260821140000_seed_requisitos.sql', import.meta.url), sql)
console.log('ok', counts)
