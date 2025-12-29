import type { CheckboxChangeEvent } from '@v-c/checkbox'
import type { EventDataNode, DataNode as FieldDataNode } from '@v-c/tree'
import type { SlotsType } from 'vue'
import type { AnyObject } from '../../../_util/type.ts'
import type { DropdownEmits, DropdownProps } from '../../../dropdown'

import type { MenuProps } from '../../../menu'
import type {
  FilterDropdownProps as ColumnFilterDropdownProps,
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
    const checked = filteredKeys.includes(key)
    const item = {
      key: filter.value !== undefined ? key : index,
      label: (
        <>
          <Component checked={checked} />
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
  filterDropdownRender?: (ctx: ColumnFilterDropdownProps & { column: ColumnType<RecordType> }) => any
  filterIconRender?: (ctx: { column: ColumnType<RecordType>, filtered: boolean }) => any
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
  SlotsType<{ default?: () => any }>
>(
  (props, { slots }) => {
    const getColumn = () => props.column as ColumnType<AnyObject>
    const getFilterDropdownProps = () => getColumn().filterDropdownProps ?? ({} as DropdownProps)
    const getFilterMode = () => props.filterMode ?? 'menu'
    const getFilterSearch = () => props.filterSearch ?? false

    const visible = shallowRef(false)
    const filtered = computed(() => {
      const filterState = props.filterState
      return !!(
        filterState
        && ((filterState.filteredKeys?.length) || filterState.forceFiltered)
      )
    })

    const triggerVisible = (newVisible: boolean) => {
      visible.value = newVisible
      ;(getFilterDropdownProps() as any).onOpenChange?.(newVisible)
      getColumn().onFilterDropdownOpenChange?.(newVisible)
    }

    if (isDev) {
      const warning = devUseWarning('Table')
      const column = getColumn()
      const deprecatedList: [keyof ColumnType<AnyObject>, string][] = [
        ['filterDropdownOpen', 'filterDropdownProps.open'],
        ['onFilterDropdownOpenChange', 'filterDropdownProps.onOpenChange'],
      ]

      deprecatedList.forEach(([deprecatedName, newName]) => {
        warning.deprecated(!(deprecatedName in column), deprecatedName, newName)
      })
      warning.deprecated(
        !('filterCheckall' in props.locale),
        'filterCheckall' as 'deprecated',
        'locale.filterCheckAll',
      )
    }

    const mergedVisible = computed(() => {
      const filterDropdownProps = getFilterDropdownProps() as any
      return filterDropdownProps.open ?? getColumn().filterDropdownOpen ?? visible.value
    })

    const propFilteredKeys = computed(() => props.filterState?.filteredKeys)
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
      if (!props.filterMultiple) {
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
      const filterState = props.filterState
      const mergedKeys = keys?.length ? keys : null
      if (mergedKeys === null && (!filterState || !filterState.filteredKeys)) {
        return null
      }

      if (isEqual(mergedKeys, filterState?.filteredKeys, true)) {
        return null
      }

      props.triggerFilter({
        column: getColumn(),
        key: props.columnKey,
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

      const column = getColumn()
      if (column.filterResetToDefaultFilteredValue) {
        setFilteredKeysSync((column.defaultFilteredValue || []).map(key => String(key)))
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

    const filterDropdownDefined = computed(() => (
      props.filterDropdownRender !== undefined || getColumn().filterDropdown !== undefined
    ))

    const onVisibleChange: DropdownEmits['openChange'] = (newVisible, info) => {
      if (info?.source === 'trigger') {
        if (newVisible && propFilteredKeys.value !== undefined) {
          setFilteredKeysSync(wrapStringListType(propFilteredKeys.value))
        }

        triggerVisible(!!newVisible)

        if (!newVisible && !filterDropdownDefined.value && props.filterOnClose) {
          onConfirm()
        }
      }
    }

    const dropdownMenuClass = computed(() => clsx({
      [`${props.dropdownPrefixCls}-menu-without-submenu`]: !hasSubMenu(getColumn().filters || []),
    }))

    const onCheckAll = (e: CheckboxChangeEvent) => {
      const column = getColumn()
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

    return () => {
      const renderEmpty = config.value.renderEmpty

      const getDropdownContent = () => {
        const column = getColumn()
        const filterSearch = getFilterSearch()
        const filterMode = getFilterMode()
        let dropdownContent: any
        const baseDropdownProps = {
          prefixCls: `${props.dropdownPrefixCls}-custom`,
          setSelectedKeys: (selectedKeys: any) => onSelectKeys({ selectedKeys: selectedKeys as string[] }),
          selectedKeys: getFilteredKeysSync(),
          confirm: doFilter,
          clearFilters: onReset,
          filters: column.filters,
          visible: mergedVisible.value,
          close: () => {
            triggerVisible(false)
          },
        }

        if (props.filterDropdownRender) {
          dropdownContent = props.filterDropdownRender({ ...baseDropdownProps, column })
        }
        else if (typeof column.filterDropdown === 'function') {
          dropdownContent = column.filterDropdown({
            ...baseDropdownProps,
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
                description={props.locale.filterEmptyText}
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
                    tablePrefixCls={props.tablePrefixCls}
                    locale={props.locale}
                  />
                  <div class={`${props.tablePrefixCls}-filter-dropdown-tree`}>
                    {props.filterMultiple
                      ? (
                          <Checkbox
                            checked={selectedKeys.length === flattenKeys(column.filters).length}
                            indeterminate={
                              selectedKeys.length > 0
                              && selectedKeys.length < flattenKeys(column.filters).length
                            }
                            class={`${props.tablePrefixCls}-filter-dropdown-checkall`}
                            onChange={onCheckAll}
                          >
                            {props.locale?.filterCheckall ?? props.locale?.filterCheckAll}
                          </Checkbox>
                        )
                      : null}
                    <Tree
                      checkable
                      selectable={false}
                      blockNode
                      multiple={props.filterMultiple}
                      checkStrictly={!props.filterMultiple}
                      class={`${props.dropdownPrefixCls}-menu`}
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
              prefixCls: props.prefixCls,
              filteredKeys: getFilteredKeysSync(),
              filterMultiple: props.filterMultiple,
              searchValue: searchValue.value,
            })
            const isEmpty = items.every(item => item === null)
            return (
              <>
                <FilterSearch
                  filterSearch={filterSearch as FilterSearchType<ColumnFilterItem>}
                  value={searchValue.value}
                  onChange={onSearch}
                  tablePrefixCls={props.tablePrefixCls}
                  locale={props.locale}
                />
                {isEmpty
                  ? (
                      empty
                    )
                  : (
                      <Menu
                        selectable
                        multiple={props.filterMultiple}
                        prefixCls={`${props.dropdownPrefixCls}-menu`}
                        class={dropdownMenuClass.value}
                        onSelect={onSelectKeys}
                        onDeselect={onSelectKeys}
                        selectedKeys={selectedKeys}
                        getPopupContainer={props.getPopupContainer}
                        openKeys={openKeys.value}
                        onOpenChange={onOpenChange}
                        items={items}
                      />
                    )}
              </>
            )
          }

          const getResetDisabled = () => {
            if (column.filterResetToDefaultFilteredValue) {
              return isEqual(
                (column.defaultFilteredValue || []).map(key => String(key)),
                selectedKeys,
                true,
              )
            }

            return selectedKeys.length === 0
          }

          dropdownContent = (
            <>
              {getFilterComponent()}
              <div class={`${props.prefixCls}-dropdown-btns`}>
                <Button type="link" size="small" disabled={getResetDisabled()} onClick={() => onReset()}>
                  {props.locale.filterReset}
                </Button>
                <Button type="primary" size="small" onClick={onConfirm}>
                  {props.locale.filterConfirm}
                </Button>
              </div>
            </>
          )
        }
        if (filterDropdownDefined.value) {
          dropdownContent = <OverrideProvider value={{ selectable: undefined }}>{dropdownContent}</OverrideProvider>
        }

        return (
          <FilterDropdownMenuWrapper className={`${props.prefixCls}-dropdown`}>
            {dropdownContent}
          </FilterDropdownMenuWrapper>
        )
      }

      const getDropdownTrigger = () => {
        const column = getColumn()
        let filterIcon: any
        if (props.filterIconRender) {
          filterIcon = props.filterIconRender({ column, filtered: filtered.value })
        }
        else if (typeof column.filterIcon === 'function') {
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
            class={clsx(`${props.prefixCls}-trigger`, { active: filtered.value })}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {filterIcon}
          </span>
        )
      }

      const getTitle = () => slots.default?.() ?? (props as any).children

      const dropdownContent = getDropdownContent()
      const filterDropdownProps = getFilterDropdownProps()
      const dropdownRootClassName = clsx(
        props.rootClassName,
        (filterDropdownProps as any).rootClassName,
        (filterDropdownProps as any).rootClass,
      )
      const mergedDropdownProps = extendsObject(
        {
          trigger: ['click'],
          placement: direction.value === 'rtl' ? 'bottomLeft' : 'bottomRight',
          getPopupContainer: props.getPopupContainer,
          prefixCls: props.dropdownPrefixCls,
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

      return (
        <div class={`${props.prefixCls}-column`}>
          <span class={`${props.tablePrefixCls}-column-title`}>{getTitle()}</span>
          <Dropdown {...mergedDropdownProps}>
            {getDropdownTrigger()}
          </Dropdown>
        </div>
      )
    }
  },
)

export default FilterDropdown
