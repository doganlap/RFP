import React, { useState, useMemo } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, Filter, SortAsc } from 'lucide-react';

interface PivotTableProps {
  data: any[];
  title?: string;
}

const PivotTable: React.FC<PivotTableProps> = ({ data, title }) => {
  const { t } = useTranslation();
  const [pivotState, setPivotState] = useState<any>({
    data,
    rows: ['department', 'status'],
    cols: ['priority'],
    vals: ['budget'],
    aggregatorName: 'Sum',
    rendererName: 'Table'
  });

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'} | null>(null);

  const handleChange = (s: any) => {
    setPivotState(s);
  };

  const availableColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        return prev.direction === 'asc'
          ? { column, direction: 'desc' }
          : null;
      }
      return { column, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    if (selectedColumns.length === 0) return sortedData;
    return sortedData.map(item =>
      selectedColumns.reduce((acc, col) => {
        acc[col] = item[col];
        return acc;
      }, {} as any)
    );
  }, [sortedData, selectedColumns]);

  const customAggregatorTemplates = useMemo(() => ({
    'Count Unique Values': (field: string) => ({
      [field]: (data: any[]) => {
        const uniqueValues = new Set(data.map(item => item[field]));
        return uniqueValues.size;
      }
    }),
    'Average Budget': (field: string) => ({
      [field]: (data: any[]) => {
        const values = data.map(item => parseFloat(item[field]) || 0);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      }
    })
  }), []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          {title}
        </h3>
      )}

      {/* Column Selection and Sorting Controls */}
      <div className="mb-4 bg-white/5 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white" />
            <span className="text-white font-medium">Column Selection:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map(column => (
              <label key={column} className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className="rounded"
                />
                {column}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <SortAsc className="w-4 h-4 text-white" />
          <span className="text-white font-medium">Sort by:</span>
          <div className="flex gap-2">
            {availableColumns.map(column => (
              <button
                key={column}
                onClick={() => handleSort(column)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                  sortConfig?.column === column
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {column}
                {sortConfig?.column === column && (
                  sortConfig.direction === 'asc'
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <PivotTableUI
          data={filteredData}
          onChange={handleChange}
          {...pivotState}
          aggregatorTemplates={customAggregatorTemplates}
          renderers={{
            ...PivotTableUI.renderers,
            'Table': (props: any) => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Array.isArray(props.cols) && props.cols.map((col: string, i: number) => (
                        <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(props.rows) && props.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Array.isArray(row) && row.map((cell: any, j: number) => (
                          <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <p className="mb-2">
          <strong>{t('analytics.pivot.instructions')}:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('analytics.pivot.dragFields')}</li>
          <li>{t('analytics.pivot.selectAggregator')}</li>
          <li>{t('analytics.pivot.chooseRenderer')}</li>
          <li>{t('analytics.pivot.exportData')}</li>
          <li>Select columns above to filter data</li>
          <li>Click column headers to sort data</li>
        </ul>
      </div>
    </div>
  );
};

export default PivotTable;
