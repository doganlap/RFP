/**
 * Contract Negotiation Stage
 * Multi-stage negotiation tracking with position management
 */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ContractNegotiation, NegotiationItem, NegotiationStage } from '../../types/workflow';
import {
  FileText,
  DollarSign,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Minus,
  Plus,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { formatDate } from '../../utils/format';

interface ContractNegotiationProps {
  rfpId: string;
  rfpTitle: string;
  contractValue: number;
  onNegotiationUpdate: (negotiation: ContractNegotiation) => void;
  existingNegotiation?: ContractNegotiation;
}

const NEGOTIATION_STAGES: { value: NegotiationStage; label: string; icon: any }[] = [
  { value: 'initial-terms', label: 'Initial Terms', icon: FileText },
  { value: 'pricing', label: 'Pricing Discussion', icon: DollarSign },
  { value: 'legal-review', label: 'Legal Review', icon: Scale },
  { value: 'sla-definition', label: 'SLA Definition', icon: Clock },
  { value: 'final-review', label: 'Final Review', icon: CheckCircle2 },
  { value: 'signature', label: 'Signature', icon: CheckCircle2 }
];

const DEFAULT_NEGOTIATION_ITEMS: Omit<NegotiationItem, 'id'>[] = [
  {
    category: 'pricing',
    description: 'Total Contract Value',
    ourPosition: '',
    clientPosition: '',
    status: 'open',
    priority: 'must-have',
    notes: ''
  },
  {
    category: 'pricing',
    description: 'Payment Terms',
    ourPosition: '30-60-10 milestone payments',
    clientPosition: '',
    status: 'open',
    priority: 'must-have',
    notes: ''
  },
  {
    category: 'legal',
    description: 'Liability Cap',
    ourPosition: 'Limited to contract value',
    clientPosition: '',
    status: 'open',
    priority: 'must-have',
    notes: ''
  },
  {
    category: 'legal',
    description: 'Intellectual Property Rights',
    ourPosition: 'Joint ownership with usage license',
    clientPosition: '',
    status: 'open',
    priority: 'must-have',
    notes: ''
  },
  {
    category: 'sla',
    description: 'Response Time - Critical Issues',
    ourPosition: '4 hours',
    clientPosition: '',
    status: 'open',
    priority: 'should-have',
    notes: ''
  },
  {
    category: 'sla',
    description: 'System Uptime Guarantee',
    ourPosition: '99.5% uptime',
    clientPosition: '',
    status: 'open',
    priority: 'should-have',
    notes: ''
  },
  {
    category: 'terms',
    description: 'Contract Duration',
    ourPosition: '3 years with annual review',
    clientPosition: '',
    status: 'open',
    priority: 'should-have',
    notes: ''
  },
  {
    category: 'terms',
    description: 'Termination Notice Period',
    ourPosition: '90 days',
    clientPosition: '',
    status: 'open',
    priority: 'nice-to-have',
    notes: ''
  }
];

export const ContractNegotiation: React.FC<ContractNegotiationProps> = ({
  rfpId,
  rfpTitle,
  contractValue,
  onNegotiationUpdate,
  existingNegotiation
}) => {
  const [currentStage, setCurrentStage] = useState<NegotiationStage>(
    existingNegotiation?.currentStage || 'initial-terms'
  );
  const [negotiationItems, setNegotiationItems] = useState<NegotiationItem[]>(
    existingNegotiation?.items ||
    DEFAULT_NEGOTIATION_ITEMS.map((item, idx) => ({ ...item, id: `item-${idx}` }))
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NegotiationItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const calculateProgress = () => {
    const total = negotiationItems.length;
    const agreed = negotiationItems.filter(i => i.status === 'agreed').length;
    const conceded = negotiationItems.filter(i => i.status === 'conceded').length;
    const deadlocked = negotiationItems.filter(i => i.status === 'deadlocked').length;
    const open = negotiationItems.filter(i => i.status === 'open').length;

    return { total, agreed, conceded, deadlocked, open };
  };

  const handleSaveItem = () => {
    if (editingItem) {
      setNegotiationItems(items =>
        items.map(item =>
          item.id === editingItem ? { ...item, ...editForm } : item
        )
      );
      setEditingItem(null);
      setEditForm({});
    } else if (showAddForm && editForm.description) {
      const newItem: NegotiationItem = {
        id: `item-${Date.now()}`,
        category: editForm.category || 'terms',
        description: editForm.description,
        ourPosition: editForm.ourPosition || '',
        clientPosition: editForm.clientPosition || '',
        status: 'open',
        priority: editForm.priority || 'should-have',
        notes: editForm.notes || ''
      };
      setNegotiationItems([...negotiationItems, newItem]);
      setShowAddForm(false);
      setEditForm({});
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this negotiation item?')) {
      setNegotiationItems(items => items.filter(i => i.id !== itemId));
    }
  };

  const handleStageComplete = () => {
    const currentIndex = NEGOTIATION_STAGES.findIndex(s => s.value === currentStage);
    if (currentIndex < NEGOTIATION_STAGES.length - 1) {
      const nextStage = NEGOTIATION_STAGES[currentIndex + 1].value;
      setCurrentStage(nextStage);
    }
  };

  const saveNegotiation = () => {
    const progress = calculateProgress();
    const allMustHavesResolved = negotiationItems
      .filter(i => i.priority === 'must-have')
      .every(i => i.status === 'agreed' || i.status === 'conceded');

    const negotiation: ContractNegotiation = {
      id: existingNegotiation?.id || `negotiation-${Date.now()}`,
      rfpId,
      currentStage,
      items: negotiationItems,
      startedAt: existingNegotiation?.startedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completedAt: currentStage === 'signature' && allMustHavesResolved
        ? new Date().toISOString()
        : undefined,
      status: currentStage === 'signature' && allMustHavesResolved
        ? 'completed'
        : progress.deadlocked > 0
        ? 'deadlocked'
        : 'in-progress'
    };

    onNegotiationUpdate(negotiation);
  };

  useEffect(() => {
    saveNegotiation();
  }, [negotiationItems, currentStage]);

  const progress = calculateProgress();
  const progressPercentage = (progress.agreed + progress.conceded) / progress.total * 100;

  const getStatusIcon = (status: NegotiationItem['status']) => {
    switch (status) {
      case 'agreed': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'conceded': return <Minus className="h-5 w-5 text-blue-600" />;
      case 'deadlocked': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: NegotiationItem['status']) => {
    switch (status) {
      case 'agreed': return 'success';
      case 'conceded': return 'default';
      case 'deadlocked': return 'danger';
      default: return 'warning';
    }
  };

  const getPriorityBadgeVariant = (priority: NegotiationItem['priority']) => {
    switch (priority) {
      case 'must-have': return 'danger';
      case 'should-have': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardBody>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Contract Negotiation</h2>
              <p className="text-gray-600">{rfpTitle}</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">
                Contract Value: ${(contractValue / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  currentStage === 'signature' ? 'success' :
                  progress.deadlocked > 0 ? 'danger' : 'warning'
                }
                size="lg"
                dot
              >
                {currentStage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                Progress: {progressPercentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stage Timeline */}
      <Card>
        <CardHeader title="Negotiation Stages" />
        <CardBody>
          <div className="flex items-center justify-between">
            {NEGOTIATION_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = stage.value === currentStage;
              const isPast = NEGOTIATION_STAGES.findIndex(s => s.value === currentStage) > index;

              return (
                <React.Fragment key={stage.value}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' :
                      isPast ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className={`text-xs mt-2 text-center ${
                      isActive ? 'font-bold text-blue-600' :
                      isPast ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {stage.label}
                    </p>
                  </div>
                  {index < NEGOTIATION_STAGES.length - 1 && (
                    <div className={`h-1 flex-1 ${
                      isPast ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={handleStageComplete}
              disabled={currentStage === 'signature'}
            >
              Complete {currentStage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{progress.agreed}</p>
              <p className="text-sm text-gray-600">Agreed</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <Minus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">{progress.conceded}</p>
              <p className="text-sm text-gray-600">Conceded</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold text-red-600">{progress.deadlocked}</p>
              <p className="text-sm text-gray-600">Deadlocked</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-3xl font-bold text-yellow-600">{progress.open}</p>
              <p className="text-sm text-gray-600">Open</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Negotiation Items */}
      <Card>
        <CardHeader
          title="Negotiation Items"
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setShowAddForm(true);
                setEditForm({ category: 'terms', priority: 'should-have', status: 'open' });
              }}
            >
              Add Item
            </Button>
          }
        />
        <CardBody>
          <div className="space-y-3">
            {/* Add Form */}
            {showAddForm && (
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium mb-3">Add Negotiation Item</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editForm.category || 'terms'}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="pricing">Pricing</option>
                      <option value="legal">Legal</option>
                      <option value="sla">SLA</option>
                      <option value="terms">Terms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editForm.priority || 'should-have'}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="must-have">Must Have</option>
                      <option value="should-have">Should Have</option>
                      <option value="nice-to-have">Nice to Have</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Payment Terms"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Our Position</label>
                    <input
                      type="text"
                      value={editForm.ourPosition || ''}
                      onChange={(e) => setEditForm({ ...editForm, ourPosition: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="What we propose"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Position</label>
                    <input
                      type="text"
                      value={editForm.clientPosition || ''}
                      onChange={(e) => setEditForm({ ...editForm, clientPosition: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="What client proposes"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditForm({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveItem}
                    disabled={!editForm.description}
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            )}

            {/* Items List */}
            {negotiationItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                {editingItem === item.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={editForm.category || item.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="pricing">Pricing</option>
                          <option value="legal">Legal</option>
                          <option value="sla">SLA</option>
                          <option value="terms">Terms</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editForm.status || item.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="open">Open</option>
                          <option value="agreed">Agreed</option>
                          <option value="conceded">Conceded</option>
                          <option value="deadlocked">Deadlocked</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Our Position</label>
                        <input
                          type="text"
                          value={editForm.ourPosition ?? item.ourPosition}
                          onChange={(e) => setEditForm({ ...editForm, ourPosition: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Position</label>
                        <input
                          type="text"
                          value={editForm.clientPosition ?? item.clientPosition}
                          onChange={(e) => setEditForm({ ...editForm, clientPosition: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={editForm.notes ?? item.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          rows={2}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={() => {
                          setEditingItem(null);
                          setEditForm({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Save className="h-4 w-4" />}
                        onClick={handleSaveItem}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.description}</h4>
                            <Badge size="sm" variant={getPriorityBadgeVariant(item.priority)}>
                              {item.priority}
                            </Badge>
                            <Badge size="sm" variant="default">
                              {item.category}
                            </Badge>
                            <Badge size="sm" variant={getStatusBadgeVariant(item.status)}>
                              {item.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Our Position:</p>
                              <p className="text-gray-600">{item.ourPosition || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Client Position:</p>
                              <p className="text-gray-600">{item.clientPosition || 'Not specified'}</p>
                            </div>
                          </div>

                          {item.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                              <p className="font-medium text-yellow-900">Notes:</p>
                              <p className="text-yellow-800">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingItem(item.id);
                            setEditForm(item);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <Card variant="elevated">
        <CardBody>
          <div className="text-center py-6">
            <h3 className="text-xl font-bold mb-4">Negotiation Summary</h3>
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {progress.agreed + progress.conceded} of {progress.total} items resolved ({progressPercentage.toFixed(0)}%)
                </p>
              </div>

              {progress.deadlocked > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">
                    ⚠️ {progress.deadlocked} item(s) are deadlocked and require escalation
                  </p>
                </div>
              )}

              {currentStage === 'signature' && progress.open === 0 && progress.deadlocked === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium text-lg">
                    All items resolved! Ready for signature.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
