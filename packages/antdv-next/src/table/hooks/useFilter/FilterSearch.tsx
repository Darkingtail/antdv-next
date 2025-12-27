import type { AnyObject } from '../../../_util/type.ts'
import type { FilterSearchType, TableLocale } from '../../interface.ts'
import { SearchOutlined } from '@antdv-next/icons'
import Input from '../../../input'

interface FilterSearchProps<RecordType = AnyObject> {
  value: string
  onChange: (e: Event) => void
  filterSearch: FilterSearchType<RecordType>
  tablePrefixCls: string
  locale: TableLocale
}

function FilterSearch<RecordType extends AnyObject = AnyObject>(props: FilterSearchProps<RecordType>) {
  const { value, filterSearch, tablePrefixCls, locale, onChange } = props
  if (!filterSearch) {
    return null
  }
  return (
    <div class={`${tablePrefixCls}-filter-dropdown-search`}>
      <Input
        prefix={<SearchOutlined />}
        placeholder={locale.filterSearchPlaceholder}
        onChange={onChange}
        value={value}
        htmlSize={1}
        class={`${tablePrefixCls}-filter-dropdown-search-input`}
      />
    </div>
  )
}

export default FilterSearch
