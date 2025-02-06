import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Copy, Edit, Trash, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CodeBlock {
  id: string;
  code: string;
  language: string;
}

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  codeBlocks: CodeBlock[];
}

const CodeSnippets = () => {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null);
  const [newSnippet, setNewSnippet] = useState<CodeSnippet>({
    id: '',
    title: '',
    description: '',
    codeBlocks: [{ id: '1', code: '', language: '' }]
  });

  const handleAddCodeBlock = (isEditing: boolean) => {
    const snippet = isEditing ? currentSnippet : newSnippet;
    if (!snippet) return;
    
    const newBlock = {
      id: Date.now().toString(),
      code: '',
      language: ''
    };
    
    if (isEditing && currentSnippet) {
      setCurrentSnippet({
        ...currentSnippet,
        codeBlocks: [...currentSnippet.codeBlocks, newBlock]
      });
    } else {
      setNewSnippet({
        ...newSnippet,
        codeBlocks: [...newSnippet.codeBlocks, newBlock]
      });
    }
  };

  const handleRemoveCodeBlock = (blockId: string, isEditing: boolean) => {
    const snippet = isEditing ? currentSnippet : newSnippet;
    if (!snippet || snippet.codeBlocks.length <= 1) return;
    
    const updatedBlocks = snippet.codeBlocks.filter(block => block.id !== blockId);
    
    if (isEditing && currentSnippet) {
      setCurrentSnippet({
        ...currentSnippet,
        codeBlocks: updatedBlocks
      });
    } else {
      setNewSnippet({
        ...newSnippet,
        codeBlocks: updatedBlocks
      });
    }
  };

  const handleAddSnippet = () => {
    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      title: newSnippet.title,
      description: newSnippet.description,
      codeBlocks: newSnippet.codeBlocks
    };
    setSnippets([...snippets, snippet]);
    setNewSnippet({
      id: '',
      title: '',
      description: '',
      codeBlocks: [{ id: '1', code: '', language: '' }]
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Code snippet added successfully",
    });
  };

  const handleEditSnippet = () => {
    if (!currentSnippet) return;
    const updatedSnippets = snippets.map(snippet =>
      snippet.id === currentSnippet.id ? currentSnippet : snippet
    );
    setSnippets(updatedSnippets);
    setIsEditDialogOpen(false);
    setCurrentSnippet(null);
    toast({
      title: "Success",
      description: "Code snippet updated successfully",
    });
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets(snippets.filter(snippet => snippet.id !== id));
    toast({
      title: "Success",
      description: "Code snippet deleted successfully",
    });
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Success",
        description: "Code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const renderCodeBlockInputs = (
    blocks: CodeBlock[],
    isEditing: boolean,
    onChange: (blockId: string, field: 'code' | 'language', value: string) => void
  ) => (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={block.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Code Block {index + 1}</h4>
            {blocks.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCodeBlock(block.id, isEditing)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Input
            placeholder="Language"
            value={block.language}
            onChange={(e) => onChange(block.id, 'language', e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="Code"
            value={block.code}
            className="font-mono"
            onChange={(e) => onChange(block.id, 'code', e.target.value)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => handleAddCodeBlock(isEditing)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Code Block
      </Button>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Code Snippets</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2" />
              Add Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Code Snippet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newSnippet.title}
                onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newSnippet.description}
                onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
              />
              {renderCodeBlockInputs(
                newSnippet.codeBlocks,
                false,
                (blockId, field, value) => {
                  const updatedBlocks = newSnippet.codeBlocks.map(block =>
                    block.id === blockId ? { ...block, [field]: value } : block
                  );
                  setNewSnippet({ ...newSnippet, codeBlocks: updatedBlocks });
                }
              )}
              <Button onClick={handleAddSnippet}>Save Snippet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <Card key={snippet.id}>
            <CardHeader>
              <CardTitle>{snippet.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{snippet.description}</p>
              {snippet.codeBlocks.map((block, index) => (
                <div key={block.id} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{block.language}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(block.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentSnippet(snippet);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteSnippet(snippet.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Code Snippet</DialogTitle>
          </DialogHeader>
          {currentSnippet && (
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={currentSnippet.title}
                onChange={(e) =>
                  setCurrentSnippet({ ...currentSnippet, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                value={currentSnippet.description}
                onChange={(e) =>
                  setCurrentSnippet({ ...currentSnippet, description: e.target.value })
                }
              />
              {renderCodeBlockInputs(
                currentSnippet.codeBlocks,
                true,
                (blockId, field, value) => {
                  const updatedBlocks = currentSnippet.codeBlocks.map(block =>
                    block.id === blockId ? { ...block, [field]: value } : block
                  );
                  setCurrentSnippet({ ...currentSnippet, codeBlocks: updatedBlocks });
                }
              )}
              <Button onClick={handleEditSnippet}>Update Snippet</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeSnippets;