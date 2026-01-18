import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import SimpleBar from 'simplebar-react'

import SidebarContent, { type SidebarItem, type SidebarSection } from '../sidebar/sidebaritems'
import { Input } from 'src/components/ui/input'

interface SearchResult {
  name: string
  url: string
  path?: string
  icon?: string
}

function flattenSections(sections: SidebarSection[]): SidebarItem[] {
  const results: SidebarItem[] = []
  for (const section of sections) {
    for (const item of section.children ?? []) {
      results.push(item)
      if (item.children?.length) {
        results.push(...item.children)
      }
    }
  }
  return results
}

export default function Search() {
  const [query, setQuery] = useState('')

  const allItems = useMemo(() => flattenSections(SidebarContent), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return allItems
      .filter((i) => Boolean(i.url) && (i.title ?? i.name).toLowerCase().includes(q))
      .slice(0, 20)
      .map((i) => ({
        name: i.title ?? i.name,
        url: i.url!,
        icon: i.icon,
      })) as SearchResult[]
  }, [allItems, query])

  return (
    <div className="relative w-full">
      <div className="flex items-center relative lg:w-xs">
        <Icon
          icon="solar:magnifer-linear"
          width="18"
          height="18"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          placeholder="Search..."
          className="rounded-xl pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div
        className={`absolute w-full bg-background rounded-md top-11 z-10 start-0 shadow-md border border-border ${
          query ? 'block' : 'hidden'
        }`}
      >
        <SimpleBar className="h-72 p-4">
          {results.length ? (
            results.map((item, i) => (
              <Link
                key={i}
                to={item.url}
                onClick={() => setQuery('')}
                className="p-2 mb-1.5 last:mb-0 flex items-center bg-input/30 gap-2 text-sm font-medium rounded-md hover:bg-primary/20 hover:text-primary w-full"
              >
                <Icon icon={item.icon ?? 'iconoir:component'} width={18} height={18} />
                <span>{item.name}</span>
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-medium font-medium text-foreground">No results</h1>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  )
}
