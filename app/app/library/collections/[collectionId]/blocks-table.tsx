'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  Loader2,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBlockAction, updateBlockAction, deleteBlockAction } from './block-actions';
import UploadCsvDialog from './upload-csv-dialog';
import {
  ColumnVisibilityToggle,
  BlockColumnVisibility,
  defaultBlockColumnVisibility,
} from './column-visibility-toggle';

interface Block {
  id: number;
  block_number: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  updated_at: string;
  updated_by: number;
}

interface BlocksTableProps {
  blocks: Block[];
  collectionId: number;
}

interface EditingBlock {
  id?: number;
  blockNumber: string;
  category: string;
  title: string;
  description: string;
}

interface CategoryGroup {
  category: string;
  blocks: Block[];
  isExpanded: boolean;
}

export function BlocksTable({ blocks: initialBlocks, collectionId }: BlocksTableProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<BlockColumnVisibility>(
    defaultBlockColumnVisibility
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<EditingBlock | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // Filter blocks by search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocks;
    const query = searchQuery.toLowerCase();
    return blocks.filter(
      (b) =>
        b.title?.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.category?.toLowerCase().includes(query) ||
        b.block_number?.toLowerCase().includes(query)
    );
  }, [blocks, searchQuery]);

  // Group blocks by category
  const categoryGroups = useMemo(() => {
    const groups: Record<string, Block[]> = {};
    filteredBlocks.forEach((block) => {
      const category = block.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(block);
    });

    // Sort categories alphabetically, but put "Uncategorized" last
    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
      })
      .map(([category, blocks]) => ({
        category,
        blocks,
        isExpanded: expandedCategories.has(category) || expandedCategories.size === 0,
      }));
  }, [filteredBlocks, expandedCategories]);

  // Initialize all categories as expanded
  useEffect(() => {
    if (expandedCategories.size === 0 && categoryGroups.length > 0) {
      setExpandedCategories(new Set(categoryGroups.map((g) => g.category)));
    }
  }, [categoryGroups.length]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const openCreateDialog = () => {
    setIsCreating(true);
    setEditingBlock({
      blockNumber: '',
      category: '',
      title: '',
      description: '',
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialogWithCategory = (category: string) => {
    setIsCreating(true);
    setEditingBlock({
      blockNumber: '',
      category: category === 'Uncategorized' ? '' : category,
      title: '',
      description: '',
    });
    setIsEditDialogOpen(true);
  };

  const openEditDialog = (block: Block) => {
    setIsCreating(false);
    setEditingBlock({
      id: block.id,
      blockNumber: block.block_number || '',
      category: block.category || '',
      title: block.title || '',
      description: block.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingBlock) return;

    setLoading(true);
    try {
      if (isCreating) {
        const result = await createBlockAction({
          ...editingBlock,
          collectionId,
        });
        if ('success' in result && result.data) {
          setBlocks([...blocks, result.data as Block]);
        }
      } else if (editingBlock.id) {
        const result = await updateBlockAction({
          ...editingBlock,
          id: editingBlock.id,
        });
        if ('success' in result && result.data) {
          setBlocks(
            blocks.map((b) =>
              b.id === editingBlock.id ? (result.data as Block) : b
            )
          );
        }
      }
      setIsEditDialogOpen(false);
      setEditingBlock(null);
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
        setBlocks(blocks.filter((b) => b.id !== id));
      }
    } finally {
      setLoading(false);
    }
  };

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length + 1; // +1 for actions

  if (blocks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Blocks
            <span className="ml-2 text-muted-foreground">(0)</span>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="h-8 bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add block
            </Button>
            <UploadCsvDialog collectionId={collectionId} />
          </div>
        </div>
        <div
          onClick={openCreateDialog}
          className="border border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-border/80 hover:bg-muted/30 transition-colors"
        >
          <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">No blocks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add blocks manually or upload a CSV file
          </p>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle >Add block</DialogTitle>
              <DialogDescription >
                Add a new block to this collection.
              </DialogDescription>
            </DialogHeader>
            <BlockEditForm
              block={editingBlock}
              onChange={setEditingBlock}
              onSave={handleSave}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={loading}
              isCreating={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Blocks
          <span className="ml-2 text-muted-foreground">({blocks.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="h-8 w-56 pl-9"
            />
          </div>
          <ColumnVisibilityToggle
            visibility={columnVisibility}
            onVisibilityChange={setColumnVisibility}
          />
          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <UploadCsvDialog collectionId={collectionId} />
        </div>
      </div>

      {filteredBlocks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No blocks match your search.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/50">
                <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
                {columnVisibility.blockNumber && (
                  <TableHead className="text-muted-foreground font-medium w-24">#</TableHead>
                )}
                {columnVisibility.title && (
                  <TableHead className="text-muted-foreground font-medium">Block</TableHead>
                )}
                {columnVisibility.description && (
                  <TableHead className="text-muted-foreground font-medium">Description</TableHead>
                )}
                {columnVisibility.lastUpdated && (
                  <TableHead className="text-muted-foreground font-medium w-28">Updated</TableHead>
                )}
                <TableHead className="text-muted-foreground font-medium w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryGroups.map((group) => (
                <React.Fragment key={`category-${group.category}`}>
                  <TableRow
                    className="border-border hover:bg-muted/30 cursor-pointer bg-muted/20 group/category"
                    onClick={() => toggleCategory(group.category)}
                  >
                    <TableCell colSpan={visibleColumnCount} className="py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {group.isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-foreground">
                            {group.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({group.blocks.length})
                          </span>
                        </div>
                        {group.isExpanded && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateDialogWithCategory(group.category);
                            }}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover/category:opacity-100 transition-opacity"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {group.isExpanded &&
                    group.blocks.map((block) => (
                      <TableRow
                        key={block.id}
                        className="border-border hover:bg-muted/50 group"
                      >
                        <TableCell></TableCell>
                        {columnVisibility.blockNumber && (
                          <TableCell className="text-muted-foreground text-sm">
                            {block.block_number || '-'}
                          </TableCell>
                        )}
                        {columnVisibility.title && (
                          <TableCell className="text-foreground">
                            <div className="line-clamp-2">{block.title || '-'}</div>
                          </TableCell>
                        )}
                        {columnVisibility.description && (
                          <TableCell className="text-muted-foreground text-sm">
                            <div className="line-clamp-2">
                              {block.description || '-'}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.lastUpdated && (
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(block.updated_at), 'MMM d')}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(block)}
                                  className="cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(block.id)}
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle >
              {isCreating ? 'Add block' : 'Edit block'}
            </DialogTitle>
            <DialogDescription >
              {isCreating
                ? 'Add a new block to this collection.'
                : 'Update the block details.'}
            </DialogDescription>
          </DialogHeader>
          <BlockEditForm
            block={editingBlock}
            onChange={setEditingBlock}
            onSave={handleSave}
            onCancel={() => setIsEditDialogOpen(false)}
            loading={loading}
            isCreating={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlockEditForm({
  block,
  onChange,
  onSave,
  onCancel,
  loading,
  isCreating,
}: {
  block: EditingBlock | null;
  onChange: (block: EditingBlock | null) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isCreating: boolean;
}) {
  if (!block) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Block #</label>
          <Input
            value={block.blockNumber}
            onChange={(e) => onChange({ ...block, blockNumber: e.target.value })}
            placeholder="Optional"
            className=""
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Category</label>
          <Input
            value={block.category}
            onChange={(e) => onChange({ ...block, category: e.target.value })}
            placeholder="e.g., Lead Management"
            className=""
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Block title</label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Enter the block title"
          className=""
          disabled={loading}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Description</label>
        <Textarea
          value={block.description}
          onChange={(e) => onChange({ ...block, description: e.target.value })}
          placeholder="Describe the block..."
          rows={4}
          className=" resize-none"
          disabled={loading}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {isCreating ? 'Add block' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
