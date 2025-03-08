import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Business } from '../types';

interface BusinessFormProps {
  business?: Business;
  onSubmit: (data: Partial<Business>) => void;
  onClose: () => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ business, onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Business>>({
    defaultValues: business || {
      status: 'draft',
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {business ? 'Edit Business' : 'Add New Business'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Business name is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
              Sector
            </label>
            <input
              type="text"
              {...register('sector', { required: 'Sector is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.sector && (
              <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              {...register('location', { required: 'Location is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="investment_required" className="block text-sm font-medium text-gray-700">
              Investment Required
            </label>
            <input
              type="number"
              {...register('investment_required', {
                required: 'Investment amount is required',
                min: { value: 0, message: 'Amount must be positive' },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.investment_required && (
              <p className="mt-1 text-sm text-red-600">{errors.investment_required.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="roi" className="block text-sm font-medium text-gray-700">
              ROI (%)
            </label>
            <input
              type="number"
              {...register('roi', {
                required: 'ROI is required',
                min: { value: 0, message: 'ROI must be positive' },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.roi && (
              <p className="mt-1 text-sm text-red-600">{errors.roi.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="available_investment" className="block text-sm font-medium text-gray-700">
              Available Investment
            </label>
            <input
              type="number"
              {...register('available_investment', {
                required: 'Available investment is required',
                min: { value: 0, message: 'Must be positive' },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.available_investment && (
              <p className="mt-1 text-sm text-red-600">{errors.available_investment.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="total_investment" className="block text-sm font-medium text-gray-700">
              Total Investment
            </label>
            <input
              type="number"
              {...register('total_investment', {
                required: 'Total investment is required',
                min: { value: 0, message: 'Must be positive' },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.total_investment && (
              <p className="mt-1 text-sm text-red-600">{errors.total_investment.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            type="url"
            {...register('image_url', { required: 'Image URL is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.image_url && (
            <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            {...register('status')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {business ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessForm;