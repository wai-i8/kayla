import type { ViewKey } from '../types';
import { Icon, type IconName } from './Icon';

interface NavigationProps {
  active: ViewKey;
  onChange: (view: ViewKey) => void;
  onAdd: () => void;
}

const items: Array<{ key: ViewKey; label: string; icon: IconName }> = [
  { key: 'today', label: '今日', icon: 'home' },
  { key: 'records', label: '紀錄', icon: 'records' },
  { key: 'guide', label: '指南', icon: 'book' },
  { key: 'calendar', label: '日曆', icon: 'calendar' },
];

export function SideNavigation({ active, onChange, onAdd }: NavigationProps) {
  return (
    <aside className="side-nav">
      <button
        type="button"
        className="side-brand"
        aria-label="返回今日首頁"
        aria-current={active === 'today' ? 'page' : undefined}
        data-testid="desktop-home-brand"
        onClick={() => onChange('today')}
      >
        <span className="brand-mark">K</span><span>KAYLA</span>
      </button>
      <nav aria-label="主要選單">
        {items.map((item) => (
          <button key={item.key} className={active === item.key ? 'active' : ''} aria-current={active === item.key ? 'page' : undefined} onClick={() => onChange(item.key)}>
            <Icon name={item.icon} /><span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="side-add" onClick={onAdd}><Icon name="plus" /> 新增紀錄</button>
      <button className={`side-settings ${active === 'settings' ? 'active' : ''}`} aria-current={active === 'settings' ? 'page' : undefined} onClick={() => onChange('settings')}>
        <Icon name="settings" /><span>設定</span>
      </button>
    </aside>
  );
}

export function BottomNavigation({ active, onChange, onAdd }: NavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="主要選單">
      {items.slice(0, 2).map((item) => (
        <button key={item.key} className={active === item.key ? 'active' : ''} aria-current={active === item.key ? 'page' : undefined} onClick={() => onChange(item.key)}>
          <Icon name={item.icon} /><span>{item.label}</span>
        </button>
      ))}
      <button className="bottom-add" onClick={onAdd} aria-label="新增紀錄"><Icon name="plus" size={27} /></button>
      {items.slice(2).map((item) => (
        <button key={item.key} className={active === item.key ? 'active' : ''} aria-current={active === item.key ? 'page' : undefined} onClick={() => onChange(item.key)}>
          <Icon name={item.icon} /><span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
