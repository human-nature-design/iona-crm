'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, X, Edit2, Plus } from 'lucide-react';
import { createBlockAction, updateBlockAction, deleteBlockAction } from './actions';
import { ContentBlock, User as UserType } from '@/lib/db/schema';

type BlockWithRelations = ContentBlock & {
  updatedBy: Pick<UserType, 'id' | 'name' | 'email'>;
};

interface FeatureTableProps {
  initialFeatures: BlockWithRelations[];
  teamId: number;
  collectionId?: number | null;
}

interface EditingBlock {
  id?: number;
  blockNumber: string;
  category: string;
  title: string;
  description: string;
}

export default function FeatureTable({ initialFeatures, collectionId }: FeatureTableProps) {
  const [blocks, setBlocks] = useState<BlockWithRelations[]>(initialFeatures);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editingData, setEditingData] = useState<EditingBlock | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setBlocks(initialFeatures);
  }, [initialFeatures]);

  const handleEdit = (block: BlockWithRelations) => {
    setEditingId(block.id);
    setEditingData({
      id: block.id,
      blockNumber: block.block_number || '',
      category: block.category || '',
      title: block.title || '',
      description: block.description || '',
    });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditingData({
      blockNumber: '',
      category: '',
      title: '',
      description: '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleSave = async () => {
    if (!editingData) return;

    setLoading(true);
    try {
      if (editingId === 'new') {
        const result = await createBlockAction({
          ...editingData,
          collectionId: collectionId || undefined,
        });
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
        } else {
          setMessage({ type: 'success', text: 'Block created successfully' });
          handleCancel();
          // Refresh the page to show new data
          window.location.reload();
        }
      } else if (typeof editingId === 'number') {
        const result = await updateBlockAction({
          ...editingData,
          id: editingId,
        });
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
        } else {
          setMessage({ type: 'success', text: 'Block updated successfully' });
          handleCancel();
          // Refresh the page to show updated data
          window.location.reload();
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    setLoading(true);
    try {
      const result = await deleteBlockAction({ id });
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Block deleted successfully' });
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {message && (
        <div className={`p-4 border-b border-gray-800 ${
          message.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
        }`}>
          {message.text}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              <th className="text-left p-4 font-medium text-gray-300">Block #</th>
              <th className="text-left p-4 font-medium text-gray-300">Category</th>
              <th className="text-left p-4 font-medium text-gray-300">Title</th>
              <th className="text-left p-4 font-medium text-gray-300">Description</th>
              <th className="text-left p-4 font-medium text-gray-300">Last Updated</th>
              <th className="text-left p-4 font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="border-b border-gray-800">
                <td className="p-4">
                  <Input
                    value={editingData?.blockNumber || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, blockNumber: e.target.value }))}
                    placeholder="Block number"
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  />
                </td>
                <td className="p-4">
                  <Input
                    value={editingData?.category || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, category: e.target.value }))}
                    placeholder="Category"
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  />
                </td>
                <td className="p-4">
                  <Textarea
                    value={editingData?.title || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, title: e.target.value }))}
                    placeholder="Title"
                    className="w-full min-h-[60px] bg-gray-800 border-gray-700 text-white"
                  />
                </td>
                <td className="p-4">
                  <Textarea
                    value={editingData?.description || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, description: e.target.value }))}
                    placeholder="Description"
                    className="w-full min-h-[60px] bg-gray-800 border-gray-700 text-white"
                  />
                </td>
                <td className="p-4 text-gray-400">New</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="border-gray-700 hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {blocks.map((block) => (
              <tr key={block.id} className="border-b border-gray-800 hover:bg-gray-850">
                {editingId === block.id ? (
                  <>
                    <td className="p-4">
                      <Input
                        value={editingData?.blockNumber || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, blockNumber: e.target.value }))}
                        className="w-full bg-gray-800 border-gray-700 text-white"
                      />
                    </td>
                    <td className="p-4">
                      <Input
                        value={editingData?.category || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, category: e.target.value }))}
                        className="w-full bg-gray-800 border-gray-700 text-white"
                      />
                    </td>
                    <td className="p-4">
                      <Textarea
                        value={editingData?.title || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, title: e.target.value }))}
                        className="w-full min-h-[60px] bg-gray-800 border-gray-700 text-white"
                      />
                    </td>
                    <td className="p-4">
                      <Textarea
                        value={editingData?.description || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, description: e.target.value }))}
                        className="w-full min-h-[60px] bg-gray-800 border-gray-700 text-white"
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {format(new Date(block.last_updated), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                          className="border-gray-700 hover:bg-gray-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-gray-300">{block.block_number || '-'}</td>
                    <td className="p-4 text-gray-300">{block.category || '-'}</td>
                    <td className="p-4 max-w-xs text-gray-300">
                      <div className="line-clamp-2">{block.title || '-'}</div>
                    </td>
                    <td className="p-4 max-w-xs text-gray-300">
                      <div className="line-clamp-2">{block.description || '-'}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {format(new Date(block.last_updated), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(block)}
                          disabled={loading || editingId !== null}
                          className="border-gray-700 hover:bg-gray-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(block.id)}
                          disabled={loading || editingId !== null}
                          className="border-gray-700 hover:bg-gray-800 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {blocks.length === 0 && editingId !== 'new' && (
        <div className="p-8 text-center text-gray-400">
          No blocks found. Upload a CSV or add blocks manually.
        </div>
      )}
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <Button
          onClick={handleAddNew}
          disabled={loading || editingId !== null}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add new block
        </Button>
      </div>
    </div>
  );
}
