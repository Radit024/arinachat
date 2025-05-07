
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InputFormProps {
  currentFeature: {
    implemented: boolean;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      placeholder?: string;
      options?: string[];
      condition?: {
        field: string;
        value: string;
      };
    }>;
  };
  formInputs: Record<string, any>;
  handleInputChange: (name: string, value: string) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  currentFeature,
  formInputs,
  handleInputChange,
  handleSelectChange
}) => {
  if (!currentFeature.implemented) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">
          We're currently working on this feature. It will be available in a future update.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {currentFeature.fields.map((field) => {
        // Check conditional display of field
        if (field.condition && formInputs[field.condition.field] !== field.condition.value) {
          return null;
        }
        
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </label>
            
            {field.type === 'select' ? (
              <Select 
                onValueChange={(value) => handleSelectChange(field.name, value)}
                value={formInputs[field.name] || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                value={formInputs[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formInputs[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InputForm;
