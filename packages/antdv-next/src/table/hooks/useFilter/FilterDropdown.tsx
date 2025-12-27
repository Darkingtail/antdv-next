import type { CheckboxChangeEvent } from '@v-c/checkbox'
import type { EventDataNode, DataNode as FieldDataNode } from '@v-c/tree'
import type { AnyObject } from '../../../_util/type.ts'
import type { DropdownEmits, DropdownProps } from '../../../dropdown'
import type { MenuProps } from '../../../menu'

import type {
  ColumnFilterItem,
  ColumnType,
  FilterKey,
  FilterSearchType,
  FilterValue,
  GetPopupContainer,
  Key,
  TableLocale,
} from '../../interface.ts'
import type { FilterState } from './index.tsx'
import { FilterFilled } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import isEqual from '@v-c/util/dist/isEqual'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import extendsObject from '../../../_util/extendsObject.ts'
import { devUseWarning, isDev } from '../../../_util/warning.ts'
import Button from '../../../button'
import Checkbox from '../../../checkbox'
import { useConfig } from '../../../config-provider/context.ts'
import Dropdown from '../../../dropdown'
import Empty from '../../../empty'
import Menu from '../../../menu'
import { OverrideProvider } from '../../../menu/OverrideContext.tsx'
import Radio from '../../../radio'
import Tree from '../../../tree'
import FilterSearch from './FilterSearch'
import FilterDropdownMenuWrapper from './FilterWrapper'

export function flattenKeys(filters?: ColumnFilterItem[]) {
  let keys: FilterValue = []
  ;(filters || []).forEach(({ value, children }) => {
    keys.push(value)
    if (children) {
      keys = [...keys, ...flattenKeys(children)]
    }
  })
  return keys
}

function hasSubMenu(filters: ColumnFilterItem[]) {
  return filters.some(({ children }) => children)
}

function searchValueMatched(searchValue: string, text: any) {
  if (typeof text === 'string' || typeof text === 'number') {
    return text?.toString().toLowerCase().includes(searchValue.trim().toLowerCase())
  }
  return false
}

function renderFilterItems({
  filters,
  prefixCls,
  filteredKeys,
  filterMultiple,
  searchValue,
  filterSearch,
}: {
  filters: ColumnFilterItem[]
  prefixCls: string
  filteredKeys: Key[]
  filterMultiple: boolean
  searchValue: string
  filterSearch: FilterSearchType<ColumnFilterItem>
}): Required<MenuProps>['items'] {
  return filters.map((filter, index) => {
    const key = String(filter.value)

    if (filter.children) {
      return {
        key: key || index,
        label: filter.text,
        popupClassName: `${prefixCls}-dropdown-submenu`,
        children: renderFilterItems({
          filters: filter.children,
          prefixCls,
          filteredKeys,
          filterMultiple,
          searchValue,
          filterSearch,
        }),
      }
    }

    const Component = filterMultiple ? Checkbox : Radio

    const item = {
      key: filter.value !== undefined ? key : index,
      label: (
        <>
          <Component checked={filteredKeys.includes(key)} />
          <span>{filter.text}</span>
        </>
      ),
    }
    if (searchValue.trim()) {
      if (typeof filterSearch === 'function') {
        return filterSearch(searchValue, filter) ? item : null
      }
      return searchValueMatched(searchValue, filter.text) ? item : null
    }
    return item
  })
}

export type TreeColumnFilterItem = ColumnFilterItem & FilterTreeDataNode

export interface FilterDropdownProps<RecordType = AnyObject> {
  tablePrefixCls: string
  prefixCls: string
  dropdownPrefixCls: string
  column: ColumnType<RecordType>
  filterState?: FilterState<RecordType>
  filterOnClose: boolean
  filterMultiple: boolean
  filterMode?: 'menu' | 'tree'
  filterSearch?: FilterSearchType<ColumnFilterItem | TreeColumnFilterItem>
  columnKey: Key
  children?: any
  triggerFilter: (filterState: FilterState<RecordType>) => void
  locale: TableLocale
  getPopupContainer?: GetPopupContainer
  filterResetToDefaultFilteredValue?: boolean
  rootClassName?: string
}

type FilterTreeDataNode = FieldDataNode

interface FilterRestProps {
  confirm?: boolean
  closeDropdown?: boolean
}

function wrapStringListType(keys?: FilterKey) {
  return (keys as string[]) || []
}

function useSyncState<T>(defaultValue: T) {
  const stateRef = shallowRef(defaultValue)
  const getState = () => stateRef.value
  const setState = (next: T | ((prev: T) => T)) => {
    stateRef.value = typeof next === 'function' ? (next as (prev: T) => T)(stateRef.value) : next
  }
  return [getState, setState] as const
}

const FilterDropdown = defineComponent<
  FilterDropdownProps,
  {
    [key: string]: (...args: any[]) => void
  },
  string,
  import('vue').SlotsType<{ default?: () => any }>
>(
  (props) => {
    const {
      tablePrefixCls,
      prefixCls,
      column,
      dropdownPrefixCls,
      columnKey,
      filterOnClose,
      filterMultiple,
      filterMode = 'menu',
      filterSearch = false,
      filterState,
      triggerFilter,
      locale,
      children,
      getPopupContainer,
      rootClassName,
    } = props

    const {
      filterResetToDefaultFilteredValue,
      defaultFilteredValue,
      filterDropdownProps = {} as DropdownProps,
      filterDropdownOpen,
      onFilterDropdownOpenChange,
    } = column as ColumnType<AnyObject>

    const visible = shallowRef(false)
    const filtered = computed(() => !!(
      filterState
      && ((filterState.filteredKeys?.length) || filterState.forceFiltered)
    ))

    const triggerVisible = (newVisible: boolean) => {
      visible.value = newVisible
      ;(filterDropdownProps as any).onOpenChange?.(newVisible)
      onFilterDropdownOpenChange?.(newVisible)
    }

    if (isDev) {
      const warning = devUseWarning('Table')
      const deprecatedList: [keyof ColumnType<AnyObject>, string][] = [
        ['filterDropdownOpen', 'filterDropdownProps.open'],
        ['onFilterDropdownOpenChange', 'filterDropdownProps.onOpenChange'],
      ]

      deprecatedList.forEach(([deprecatedName, newName]) => {
        warning.deprecated(!(deprecatedName in column), deprecatedName, newName)
      })
      warning.deprecated(
        !('filterCheckall' in locale),
        'filterCheckall' as 'deprecated',
        'locale.filterCheckAll',
      )
    }

    const mergedVisible = computed(() =>
      (filterDropdownProps as any).open
      ?? filterDropdownOpen
      ?? visible.value,
    )

    const propFilteredKeys = computed(() => filterState?.filteredKeys)
    const [getFilteredKeysSync, setFilteredKeysSync] = useSyncState(
      wrapStringListType(propFilteredKeys.value),
    )

    const onSelectKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
      setFilteredKeysSync(selectedKeys)
    }

    const onCheck = (
      keys: string[],
      { node, checked }: { node: EventDataNode<FilterTreeDataNode>, checked: boolean },
    ) => {
      if (!filterMultiple) {
        onSelectKeys({ selectedKeys: checked && node.key ? [node.key as string] : [] })
      }
      else {
        onSelectKeys({ selectedKeys: keys })
      }
    }

    watch([propFilteredKeys, mergedVisible], ([nextKeys, nextVisible]) => {
      if (!nextVisible) {
        return
      }
      onSelectKeys({ selectedKeys: wrapStringListType(nextKeys as FilterKey) })
    })

    const openKeys = shallowRef<string[]>([])
    const onOpenChange = (keys: string[]) => {
      openKeys.value = keys
    }

    const searchValue = shallowRef('')
    const onSearch = (e: Event) => {
      const target = e.target as HTMLInputElement
      searchValue.value = target?.value || ''
    }

    watch(mergedVisible, (nextVisible) => {
      if (!nextVisible) {
        searchValue.value = ''
      }
    })

    const internalTriggerFilter = (keys?: string[]) => {
      const mergedKeys = keys?.length ? keys : null
      if (mergedKeys === null && (!filterState || !filterState.filteredKeys)) {
        return null
      }

      if (isEqual(mergedKeys, filterState?.filteredKeys, true)) {
        return null
      }

      triggerFilter({
        column,
        key: columnKey,
        filteredKeys: mergedKeys as FilterKey,
      })
    }

    const onConfirm = () => {
      triggerVisible(false)
      internalTriggerFilter(getFilteredKeysSync())
    }

    const onReset = (
      { confirm, closeDropdown }: FilterRestProps = { confirm: false, closeDropdown: false },
    ) => {
      if (confirm) {
        internalTriggerFilter([])
      }
      if (closeDropdown) {
        triggerVisible(false)
      }

      searchValue.value = ''

      if (filterResetToDefaultFilteredValue) {
        setFilteredKeysSync((defaultFilteredValue || []).map(key => String(key)))
      }
      else {
        setFilteredKeysSync([])
      }
    }

    const doFilter = ({ closeDropdown } = { closeDropdown: true }) => {
      if (closeDropdown) {
        triggerVisible(false)
      }
      internalTriggerFilter(getFilteredKeysSync())
    }

    const onVisibleChange: DropdownEmits['openChange'] = (newVisible, info) => {
      if (info?.source === 'trigger') {
        if (newVisible && propFilteredKeys.value !== undefined) {
          setFilteredKeysSync(wrapStringListType(propFilteredKeys.value))
        }

        triggerVisible(!!newVisible)

        if (!newVisible && !column.filterDropdown && filterOnClose) {
          onConfirm()
        }
      }
    }

    const dropdownMenuClass = clsx({
      [`${dropdownPrefixCls}-menu-without-submenu`]: !hasSubMenu(column.filters || []),
    })

    const onCheckAll = (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        const allFilterKeys = flattenKeys(column?.filters).map(key => String(key))
        setFilteredKeysSync(allFilterKeys)
      }
      else {
        setFilteredKeysSync([])
      }
    }

    const getTreeData = ({ filters }: { filters?: ColumnFilterItem[] }) =>
      (filters || []).map((filter, index) => {
        const key = String(filter.value)
        const item: FilterTreeDataNode = {
          title: filter.text,
          key: filter.value !== undefined ? key : String(index),
        }
        if (filter.children) {
          item.children = getTreeData({ filters: filter.children })
        }
        return item
      })

    const getFilterData = (node: FilterTreeDataNode): TreeColumnFilterItem => ({
      ...node,
      text: node.title as any,
      value: node.key,
      children: node.children?.map(item => getFilterData(item)) || [],
    })

    const config = useConfig()
    const direction = computed(() => config.value.direction)
    const renderEmpty = config.value.renderEmpty

    let dropdownContent: any

    if (typeof column.filterDropdown === 'function') {
      dropdownContent = column.filterDropdown({
        prefixCls: `${dropdownPrefixCls}-custom`,
        setSelectedKeys: selectedKeys => onSelectKeys({ selectedKeys: selectedKeys as string[] }),
        selectedKeys: getFilteredKeysSync(),
        confirm: doFilter,
        clearFilters: onReset,
        filters: column.filters,
        visible: mergedVisible.value,
        close: () => {
          triggerVisible(false)
        },
      })
    }
    else if (column.filterDropdown) {
      dropdownContent = column.filterDropdown
    }
    else {
      const selectedKeys = getFilteredKeysSync() || []
      const getFilterComponent = () => {
        const empty = renderEmpty?.('Table.filter') ?? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={locale.filterEmptyText}
            styles={{
              image: { height: 24 },
            }}
            style={{
              margin: 0,
              padding: '16px 0',
            }}
          />
        )
        if ((column.filters || []).length === 0) {
          return empty
        }
        if (filterMode === 'tree') {
          return (
            <>
              <FilterSearch<TreeColumnFilterItem>
                filterSearch={filterSearch}
                value={searchValue.value}
                onChange={onSearch}
                tablePrefixCls={tablePrefixCls}
                locale={locale}
              />
              <div class={`${tablePrefixCls}-filter-dropdown-tree`}>
                {filterMultiple
                  ? (
                      <Checkbox
                        checked={selectedKeys.length === flattenKeys(column.filters).length}
                        indeterminate={
                          selectedKeys.length > 0
                          && selectedKeys.length < flattenKeys(column.filters).length
                        }
                        class={`${tablePrefixCls}-filter-dropdown-checkall`}
                        onChange={onCheckAll}
                      >
                        {locale?.filterCheckall ?? locale?.filterCheckAll}
                      </Checkbox>
                    )
                  : null}
                <Tree
                  checkable
                  selectable={false}
                  blockNode
                  multiple={filterMultiple}
                  checkStrictly={!filterMultiple}
                  class={`${dropdownPrefixCls}-menu`}
                  onCheck={onCheck}
                  checkedKeys={selectedKeys}
                  selectedKeys={selectedKeys}
                  showIcon={false}
                  treeData={getTreeData({ filters: column.filters })}
                  autoExpandParent
                  defaultExpandAll
                  filterTreeNode={
                    searchValue.value.trim()
                      ? (node: FilterTreeDataNode) => {
                          if (typeof filterSearch === 'function') {
                            return (filterSearch as any)(searchValue.value, getFilterData(node))
                          }
                          return searchValueMatched(searchValue.value, node.title)
                        }
                      : undefined
                  }
                />
              </div>
            </>
          )
        }
        const items = renderFilterItems({
          filters: column.filters || [],
          filterSearch: filterSearch as FilterSearchType<ColumnFilterItem>,
          prefixCls,
          filteredKeys: getFilteredKeysSync(),
          filterMultiple,
          searchValue: searchValue.value,
        })
        const isEmpty = items.every(item => item === null)

        return (
          <>
            <FilterSearch
              filterSearch={filterSearch as FilterSearchType<ColumnFilterItem>}
              value={searchValue.value}
              onChange={onSearch}
              tablePrefixCls={tablePrefixCls}
              locale={locale}
            />
            {isEmpty
              ? (
                  empty
                )
              : (
                  <Menu
                    selectable
                    multiple={filterMultiple}
                    prefixCls={`${dropdownPrefixCls}-menu`}
                    class={dropdownMenuClass}
                    onSelect={onSelectKeys}
                    onDeselect={onSelectKeys}
                    selectedKeys={selectedKeys}
                    getPopupContainer={getPopupContainer}
                    openKeys={openKeys.value}
                    onOpenChange={onOpenChange}
                    items={items}
                  />
                )}
          </>
        )
      }

      const getResetDisabled = () => {
        if (filterResetToDefaultFilteredValue) {
          return isEqual(
            (defaultFilteredValue || []).map(key => String(key)),
            selectedKeys,
            true,
          )
        }

        return selectedKeys.length === 0
      }

      dropdownContent = (
        <>
          {getFilterComponent()}
          <div class={`${prefixCls}-dropdown-btns`}>
            <Button type="link" size="small" disabled={getResetDisabled()} onClick={() => onReset()}>
              {locale.filterReset}
            </Button>
            <Button type="primary" size="small" onClick={onConfirm}>
              {locale.filterConfirm}
            </Button>
          </div>
        </>
      )
    }

    if (column.filterDropdown) {
      dropdownContent = <OverrideProvider value={{ selectable: undefined }}>{dropdownContent}</OverrideProvider>
    }

    dropdownContent = (
      <FilterDropdownMenuWrapper className={`${prefixCls}-dropdown`}>
        {dropdownContent}
      </FilterDropdownMenuWrapper>
    )

    const getDropdownTrigger = () => {
      let filterIcon: any
      if (typeof column.filterIcon === 'function') {
        filterIcon = column.filterIcon(filtered.value)
      }
      else if (column.filterIcon) {
        filterIcon = column.filterIcon
      }
      else {
        filterIcon = <FilterFilled />
      }

      return (
        <span
          role="button"
          tabindex={-1}
          class={clsx(`${prefixCls}-trigger`, { active: filtered.value })}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {filterIcon}
        </span>
      )
    }

    const dropdownRootClassName = clsx(
      rootClassName,
      (filterDropdownProps as any).rootClassName,
      (filterDropdownProps as any).rootClass,
    )

    const mergedDropdownProps = extendsObject(
      {
        trigger: ['click'],
        placement: direction.value === 'rtl' ? 'bottomLeft' : 'bottomRight',
        getPopupContainer,
        prefixCls: dropdownPrefixCls,
        rootClass: dropdownRootClassName,
      },
      {
        ...(filterDropdownProps as any),
        open: mergedVisible.value,
        onOpenChange: onVisibleChange,
        popupRender: () => {
          if (typeof (filterDropdownProps as any).popupRender === 'function') {
            return (filterDropdownProps as any).popupRender(dropdownContent)
          }
          if (typeof (filterDropdownProps as any).dropdownRender === 'function') {
            return (filterDropdownProps as any).dropdownRender(dropdownContent)
          }
          return dropdownContent
        },
      },
    )

    return () => (
      <div class={`${prefixCls}-column`}>
        <span class={`${tablePrefixCls}-column-title`}>{children}</span>
        <Dropdown {...mergedDropdownProps}>
          {getDropdownTrigger()}
        </Dropdown>
      </div>
    )
  },
)

export default FilterDropdown
