// src/pages/Contracts.jsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Plus, Eye, Edit, Trash2, MoreVertical, Calendar, DollarSign, FileCheck, Loader2, TrendingUp, CheckCircle, AlertTriangle, Clock, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { apiService } from '@/api/services';

// Date formatting helper
const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    return 'Error';
  }
};

// Form validation schema
const contractSchema = z.object({
  supplierName: z.string().min(2, 'Supplier name must be at least 2 characters'),
  supplierType: z.enum(['farmer', 'aggregator']),
  contractedQuantity: z.coerce.number().min(1, 'Quantity must be at least 1 ton'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  pricingTerms: z.string().min(5, 'Pricing terms are required'),
  paymentTerms: z.string().optional(),
  fulfillmentPercentage: z.coerce.number().min(0).max(100, 'Fulfillment must be between 0-100'),
  status: z.enum(['draft', 'active', 'completed', 'terminated']),
  notes: z.string().optional(),
  contractImage: z.any().optional(),
});

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      supplierName: '',
      supplierType: 'farmer',
      contractedQuantity: 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricingTerms: '',
      paymentTerms: '',
      fulfillmentPercentage: 0,
      status: 'draft',
      notes: '',
      contractImage: null,
    },
  });

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await apiService.contracts.getAll();
      if (response && Array.isArray(response.data)) {
        setContracts(response.data || []);
      } else if (response && Array.isArray(response)) {
        setContracts(response || []);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'contractImage') {
          formData.append(key, data[key]);
        }
      });
      
      if (selectedFile) {
        formData.append('contractImage', selectedFile);
      }
      
      if (editingContract) {
        await apiService.contracts.update(editingContract.id, formData);
        toast.success(`Contract with ${data.supplierName} updated successfully`);
      } else {
        await apiService.contracts.create(formData);
        toast.success(`New contract with ${data.supplierName} created successfully`);
      }
      
      await fetchContracts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Failed to save contract');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset({
      supplierName: '',
      supplierType: 'farmer',
      contractedQuantity: 20,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricingTerms: '',
      paymentTerms: '',
      fulfillmentPercentage: 0,
      status: 'draft',
      notes: '',
      contractImage: null,
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setEditingContract(null);
  };

  // Handle edit
  const handleEdit = (contract) => {
    setEditingContract(contract);
    form.reset({
      supplierName: contract.supplierName,
      supplierType: contract.supplierType,
      contractedQuantity: contract.contractedQuantity,
      startDate: contract.startDate ? formatDate(contract.startDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      endDate: contract.endDate ? formatDate(contract.endDate, 'yyyy-MM-dd') : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricingTerms: contract.pricingTerms,
      paymentTerms: contract.paymentTerms || '',
      fulfillmentPercentage: contract.fulfillmentPercentage,
      status: contract.status,
      notes: contract.notes || '',
      contractImage: null,
    });
    setPreviewImage(contract.contractImageUrl || null);
    setIsDialogOpen(true);
  };

  // Handle view
  const handleView = (contract) => {
    setViewingContract(contract);
    setIsViewDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;
    
    try {
      await apiService.contracts.delete(contractToDelete.id);
      toast.success(`Contract with ${contractToDelete.supplierName} deleted successfully`);
      await fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    } finally {
      setIsDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'active': <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>,
      'completed': <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Completed</span>,
      'terminated': <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Terminated</span>,
      'draft': <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 flex items-center gap-1"><Clock className="h-3 w-3" /> Draft</span>,
    };
    return badges[status] || <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{status}</span>;
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Contracts" description="Manage supplier contracts and agreements">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#217A2D] mx-auto" />
            <p className="mt-4 text-gray-500">Loading contracts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contracts" description="Manage supplier contracts and agreements">
      {/* Summary Cards - Reverted to original */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</p>
            </div>
            <p className="text-sm text-gray-500">Active Contracts</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-2xl font-bold">
                {contracts.reduce((sum, contract) => sum + (contract.contractedQuantity || 0), 0)}
              </p>
            </div>
            <p className="text-sm text-gray-500">Total Contracted Qty (tons)</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileCheck className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-2xl font-bold">
                {contracts.length > 0 
                  ? Math.round(contracts.reduce((sum, contract) => sum + (contract.fulfillmentPercentage || 0), 0) / contracts.length)
                  : 0}%
              </p>
            </div>
            <p className="text-sm text-gray-500">Avg. Fulfillment Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#217A2D]" />
                Contract Management
              </h2>
              <p className="text-gray-500">
                {contracts.length === 0 ? 'No contracts yet' : `${contracts.length} contracts in the system`}
              </p>
            </div>
            
            <button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              disabled={submitting}
              className="bg-[#217A2D] hover:bg-[#1a5e23] text-white px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              New Contract
            </button>
          </div>
        </div>

        <div className="p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Contracts Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start managing your supplier relationships by creating your first contract.
              </p>
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#217A2D] hover:bg-[#1a5e23] text-white px-6 py-3 rounded-md flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create First Contract
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (tons)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Terms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{contract.supplierName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${contract.supplierType === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {contract.supplierType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                        {contract.contractedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(contract.startDate, 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {formatDate(contract.endDate, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm max-w-xs flex items-start gap-1">
                          <DollarSign className="h-3 w-3 mt-0.5 text-gray-400" />
                          <span className="line-clamp-2">{contract.pricingTerms}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contract.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(contract)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(contract)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setContractToDelete({ id: contract.id, supplierName: contract.supplierName });
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Contract Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingContract ? 'Edit Contract' : 'Create New Contract'}
                </h3>
                <button
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Supplier Name and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      {...form.register('supplierName')}
                      placeholder="Mary Wanjiku"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    />
                    {form.formState.errors.supplierName && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.supplierName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Type *
                    </label>
                    <select
                      {...form.register('supplierType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="aggregator">Aggregator</option>
                    </select>
                  </div>
                </div>

                {/* Quantity and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (tons) *
                    </label>
                    <input
                      type="number"
                      {...form.register('contractedQuantity')}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...form.register('startDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      {...form.register('endDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    />
                  </div>
                </div>

                {/* Pricing Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Terms *
                  </label>
                  <input
                    type="text"
                    {...form.register('pricingTerms')}
                    placeholder="KES 26/kg, weekly payments"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    {...form.register('paymentTerms')}
                    placeholder="Net 30, bank transfer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                  />
                </div>

                {/* Fulfillment and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fulfillment %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...form.register('fulfillmentPercentage')}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      {...form.register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Contract Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Document/Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#217A2D]">
                      <Upload className="h-4 w-4 inline mr-2" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    {selectedFile && (
                      <span className="ml-3 text-sm text-gray-500">{selectedFile.name}</span>
                    )}
                  </div>
                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage}
                        alt="Contract preview"
                        className="h-32 w-auto object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    {...form.register('notes')}
                    placeholder="Additional notes or terms..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#217A2D] focus:border-[#217A2D]"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[#217A2D] text-white rounded-md text-sm font-medium hover:bg-[#1a5e23] flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingContract ? 'Update Contract' : 'Create Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Contract Dialog */}
      {isViewDialogOpen && viewingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#217A2D]" />
                  Contract Details
                </h3>
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="font-semibold">{viewingContract.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${viewingContract.supplierType === 'farmer' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      {viewingContract.supplierType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-semibold">{viewingContract.contractedQuantity} tons</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(viewingContract.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{formatDate(viewingContract.startDate, 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p>{formatDate(viewingContract.endDate, 'PPP')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Pricing Terms</p>
                  <p>{viewingContract.pricingTerms}</p>
                </div>

                {viewingContract.paymentTerms && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Terms</p>
                    <p>{viewingContract.paymentTerms}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Fulfillment Progress</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{viewingContract.fulfillmentPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#217A2D] h-2 rounded-full" 
                        style={{ width: `${viewingContract.fulfillmentPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {viewingContract.contractImageUrl && (
                  <div>
                    <p className="text-sm text-gray-500">Contract Document</p>
                    <img 
                      src={viewingContract.contractImageUrl} 
                      alt="Contract document" 
                      className="mt-2 h-32 w-auto rounded border"
                    />
                  </div>
                )}

                {viewingContract.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-600">{viewingContract.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(viewingContract);
                  }}
                  className="px-4 py-2 bg-[#217A2D] text-white rounded-md text-sm font-medium hover:bg-[#1a5e23]"
                >
                  Edit Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Contract</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete the contract with "{contractToDelete?.supplierName}"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
