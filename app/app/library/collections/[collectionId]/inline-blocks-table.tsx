'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, X, Edit2, Plus, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createBlockAction, updateBlockAction, deleteBlockAction } from './block-actions';
import UploadCsvDialog from './upload-csv-dialog';

interface BlockWithRelations {
  id: number;
  block_number: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  updated_at: string;
  updated_by: number;
  updatedBy: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface InlineBlocksTableProps {
  blocks: BlockWithRelations[];
  collectionId: number;
}

interface EditingBlock {
  id?: number;
  blockNumber: string;
  category: string;
  title: string;
  description: string;
}

export default function InlineBlocksTable({ blocks: initialBlocks, collectionId }: InlineBlocksTableProps) {
  const [blocks, setBlocks] = useState<BlockWithRelations[]>(initialBlocks);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editingData, setEditingData] = useState<EditingBlock | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

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
          collectionId,
        });
        if ('success' in result && result.data) {
          // Add the new block to the state
          setBlocks([...blocks, result.data as BlockWithRelations]);
          handleCancel();
        }
      } else if (typeof editingId === 'number') {
        const result = await updateBlockAction({
          ...editingData,
          id: editingId,
        });
        if ('success' in result && result.data) {
          // Update the block in the state
          setBlocks(blocks.map(block =>
            block.id === editingId ? result.data as BlockWithRelations : block
          ));
          handleCancel();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    setLoading(true);
    try {
      const result = await deleteBlockAction({ id });
      if (!result.error) {
        // Remove the block from the state
        setBlocks(blocks.filter(block => block.id !== id));
      }
    } finally {
      setLoading(false);
    }
  };

  if (blocks.length === 0 && editingId !== 'new') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No blocks added yet.</p>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleAddNew}
            className="bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add first block
          </Button>
          <UploadCsvDialog collectionId={collectionId} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium w-[100px]">Block #</TableHead>
              <TableHead className="text-muted-foreground font-medium w-[150px]">Category</TableHead>
              <TableHead className="text-muted-foreground font-medium">Block</TableHead>
              <TableHead className="text-muted-foreground font-medium">Description</TableHead>
              <TableHead className="text-muted-foreground font-medium w-[120px]">Last Updated</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id} className="border-border hover:bg-muted/50">
                {editingId === block.id ? (
                  <>
                    <TableCell className="p-2">
                      <Input
                        value={editingData?.blockNumber || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, blockNumber: e.target.value }))}
                        className="w-full h-8"
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        value={editingData?.category || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, category: e.target.value }))}
                        className="w-full h-8"
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Textarea
                        value={editingData?.title || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, title: e.target.value }))}
                        className="w-full min-h-[60px]"
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Textarea
                        value={editingData?.description || ''}
                        onChange={(e) => setEditingData(prev => ({ ...prev!, description: e.target.value }))}
                        className="w-full min-h-[60px]"
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {block.updated_at ? format(new Date(block.updated_at), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={loading}
                          className="h-8 w-8 p-0"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-foreground">{block.block_number || '-'}</TableCell>
                    <TableCell className="text-foreground">{block.category || '-'}</TableCell>
                    <TableCell className="text-foreground">
                      <div className="line-clamp-2">{block.title || '-'}</div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="line-clamp-2">{block.description || '-'}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {block.updated_at ? format(new Date(block.updated_at), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(block)}
                          disabled={loading || editingId !== null}
                          className="h-8 w-8 p-0 hover:bg-accent"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(block.id)}
                          disabled={loading || editingId !== null}
                          className="h-8 w-8 p-0 hover:bg-accent hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {editingId === 'new' && (
              <TableRow className="border-border bg-muted/30">
                <TableCell className="p-2">
                  <Input
                    value={editingData?.blockNumber || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, blockNumber: e.target.value }))}
                    placeholder="#"
                    className="w-full h-8"
                    disabled={loading}
                    autoFocus
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={editingData?.category || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, category: e.target.value }))}
                    placeholder="Category"
                    className="w-full h-8"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Textarea
                    value={editingData?.title || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, title: e.target.value }))}
                    placeholder="Block"
                    className="w-full min-h-[60px]"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Textarea
                    value={editingData?.description || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev!, description: e.target.value }))}
                    placeholder="Description"
                    className="w-full min-h-[60px]"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">New</TableCell>
                <TableCell className="text-right p-2">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {blocks.length > 0 && editingId !== 'new' && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Button
              onClick={handleAddNew}
              disabled={loading || editingId !== null}
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add new block
            </Button>
            <UploadCsvDialog collectionId={collectionId} />
          </div>
        </div>
      )}
    </div>
  );
}
