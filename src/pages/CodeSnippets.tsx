import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Copy, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
}

const CodeSnippets = () => {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    description: '',
    code: '',
    language: ''
  });

  const handleAddSnippet = () => {
    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      ...newSnippet
    };
    setSnippets([...snippets, snippet]);
    setNewSnippet({ title: '', description: '', code: '', language: '' });
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Code Snippet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newSnippet.title}
                onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
              />
              <Input
                placeholder="Language"
                value={newSnippet.language}
                onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newSnippet.description}
                onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
              />
              <Textarea
                placeholder="Code"
                value={newSnippet.code}
                className="font-mono"
                onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
              />
              <Button onClick={handleAddSnippet}>Save Snippet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <Card key={snippet.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{snippet.title}</span>
                <span className="text-sm text-muted-foreground">{snippet.language}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{snippet.description}</p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{snippet.code}</code>
              </pre>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(snippet.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
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
        <DialogContent>
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
              <Input
                placeholder="Language"
                value={currentSnippet.language}
                onChange={(e) =>
                  setCurrentSnippet({ ...currentSnippet, language: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                value={currentSnippet.description}
                onChange={(e) =>
                  setCurrentSnippet({ ...currentSnippet, description: e.target.value })
                }
              />
              <Textarea
                placeholder="Code"
                value={currentSnippet.code}
                className="font-mono"
                onChange={(e) =>
                  setCurrentSnippet({ ...currentSnippet, code: e.target.value })
                }
              />
              <Button onClick={handleEditSnippet}>Update Snippet</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeSnippets;