/**
 * MenuItem — A focusable row for vertical menus
 *
 * @example
 * items.map((item, i) => (
 *   <MenuItem
 *     key={item.id}
 *     label={item.label}
 *     icon={item.icon}
 *     focused={isFocused(i)}
 *     onClick={() => navigate(item.route)}
 *   />
 * ))
 */

import React from 'react'

interface MenuItemProps {
  label: string
  icon?: string
  focused?: boolean
  onClick?: () => void
  sublabel?: string
}

export function MenuItem({ label, icon, focused = false, onClick, sublabel }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'w-[180px] h-[28px] flex items-center gap-2 px-2 rounded-sm border transition-all duration-100 cursor-pointer select-none',
        focused
          ? 'border-cp-accent bg-cp-bg3 text-cp-accent2'
          : 'border-cp-border bg-cp-bg2 text-cp-muted',
      ].join(' ')}
    >
      {icon && <span className="text-[12px] w-5 text-center">{icon}</span>}
      <span className="flex-1 text-[9px] tracking-wide">{label}</span>
      {sublabel && (
        <span className="text-[7px] text-cp-border2">{sublabel}</span>
      )}
      <span className={`text-[8px] ${focused ? 'text-cp-accent' : 'text-cp-border2'}`}>▶</span>
    </div>
  )
}
