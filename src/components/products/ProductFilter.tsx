import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onChange: (options: string[]) => void;
}

const FilterSection = ({ title, options, selectedOptions, onChange }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onChange(selectedOptions.filter(id => id !== optionId));
    } else {
      onChange([...selectedOptions, optionId]);
    }
  };
  
  return (
    <div className="border-b border-cream-200 pb-4">
      <button 
        className="flex justify-between items-center w-full py-2 text-left font-medium text-charcoal-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {options.map(option => (
                <label key={option.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-cream-200 text-gold-400 focus:ring-gold-400"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                  />
                  <span className="ml-2 text-sm text-charcoal-600">{option.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PriceRangeProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const PriceRangeFilter = ({ min, max, value, onChange }: PriceRangeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    setLocalMin(newMin);
    if (newMin <= localMax) {
      onChange([newMin, localMax]);
    }
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    setLocalMax(newMax);
    if (newMax >= localMin) {
      onChange([localMin, newMax]);
    }
  };
  
  return (
    <div className="border-b border-cream-200 pb-4">
      <button 
        className="flex justify-between items-center w-full py-2 text-left font-medium text-charcoal-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        Price Range
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              <div className="flex items-center">
                <span className="text-sm text-charcoal-600 mr-2">$</span>
                <input
                  type="number"
                  min={min}
                  max={localMax}
                  value={localMin}
                  onChange={handleMinChange}
                  className="w-full rounded-md border border-cream-200 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
                <span className="mx-2 text-charcoal-600">-</span>
                <span className="text-sm text-charcoal-600 mr-2">$</span>
                <input
                  type="number"
                  min={localMin}
                  max={max}
                  value={localMax}
                  onChange={handleMaxChange}
                  className="w-full rounded-md border border-cream-200 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
              </div>
              
              <div className="px-2">
                <div className="relative h-2 bg-cream-200 rounded-full">
                  <div
                    className="absolute h-full bg-gold-400 rounded-full"
                    style={{
                      left: `${((localMin - min) / (max - min)) * 100}%`,
                      right: `${100 - ((localMax - min) / (max - min)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ProductFilterProps {
  onFilterChange: (filters: any) => void;
}

const ProductFilter = ({ onFilterChange }: ProductFilterProps) => {
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [metalFilters, setMetalFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  const handleCategoryChange = (selected: string[]) => {
    setCategoryFilters(selected);
    onFilterChange({
      categories: selected,
      metals: metalFilters,
      priceRange
    });
  };
  
  const handleMetalChange = (selected: string[]) => {
    setMetalFilters(selected);
    onFilterChange({
      categories: categoryFilters,
      metals: selected,
      priceRange
    });
  };
  
  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
    onFilterChange({
      categories: categoryFilters,
      metals: metalFilters,
      priceRange: range
    });
  };
  
  return (
    <div className="space-y-6">
      <FilterSection
        title="Categories"
        options={[
          { id: 'gold', label: 'Gold' },
          { id: 'diamond', label: 'Diamond' },
          { id: 'silver', label: 'Silver' },
          { id: 'platinum', label: 'Platinum' }
        ]}
        selectedOptions={categoryFilters}
        onChange={handleCategoryChange}
      />
      
      <FilterSection
        title="Metal"
        options={[
          { id: 'gold', label: 'Gold' },
          { id: 'white-gold', label: 'White Gold' },
          { id: 'rose-gold', label: 'Rose Gold' },
          { id: 'silver', label: 'Silver' },
          { id: 'platinum', label: 'Platinum' }
        ]}
        selectedOptions={metalFilters}
        onChange={handleMetalChange}
      />
      
      <PriceRangeFilter
        min={0}
        max={10000}
        value={priceRange}
        onChange={handlePriceChange}
      />
    </div>
  );
};

export default ProductFilter;