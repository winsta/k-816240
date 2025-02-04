import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from './ui/button';
import { Plus, X, CalendarIcon, ListPlus, Upload } from 'lucide-react';
import { useToast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";

interface TeamMember {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
}

interface Subtask {
  id: string;
  content: string;
  completed: boolean;
}

interface ClientInfo {
  contactNumber: string;
  email: string;
  companyName: string;
  address: string;
}

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  clientName: string;
  clientInfo?: ClientInfo;
  projectName: string;
  parentId?: string;
  isExpanded?: boolean;
  totalCost?: number;
  expenses?: Expense[];
  assignedTeam?: TeamMember[];
  status: 'not-started' | 'in-progress' | 'completed';
  attachments?: string[];
  notes?: string;
}

interface KanbanData {
  [key: string]: {
    title: string;
    items: Task[];
  };
}

const initialData: KanbanData = {
  todo: {
    title: 'To Do',
    items: [
      { 
        id: 'task-1', 
        content: 'Create project documentation', 
        priority: 'medium', 
        tags: ['docs'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Documentation Portal',
        status: 'not-started'
      },
      { 
        id: 'task-2', 
        content: 'Design user interface', 
        priority: 'high', 
        tags: ['design'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'UI Design',
        status: 'not-started'
      },
      { 
        id: 'task-3', 
        content: 'Implement authentication', 
        priority: 'high', 
        tags: ['backend'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Auth Module',
        status: 'not-started'
      },
    ],
  },
  inProgress: {
    title: 'In Progress',
    items: [
      { 
        id: 'task-4', 
        content: 'Develop API endpoints', 
        priority: 'medium', 
        tags: ['backend'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'API Development',
        status: 'in-progress'
      },
      { 
        id: 'task-5', 
        content: 'Write unit tests', 
        priority: 'low', 
        tags: ['testing'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Testing Suite',
        status: 'in-progress'
      },
    ],
  },
  done: {
    title: 'Done',
    items: [
      { 
        id: 'task-6', 
        content: 'Project setup', 
        priority: 'high', 
        tags: ['setup'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Initial Setup',
        status: 'completed'
      },
      { 
        id: 'task-7', 
        content: 'Initial planning', 
        priority: 'medium', 
        tags: ['planning'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Planning Phase',
        status: 'completed'
      },
    ],
  },
};

const predefinedTags = [
  'frontend', 'backend', 'design', 'bug', 'feature', 'docs', 
  'testing', 'urgent', 'planning', 'setup'
];

const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanData>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContactNumber, setClientContactNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompanyName, setClientCompanyName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assignedTeam, setAssignedTeam] = useState<TeamMember[]>([]);
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [notes, setNotes] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    }
  };

  const addTask = (columnId: string) => {
    setActiveColumn(columnId);
    setNewTaskContent('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(undefined);
    setSelectedTags([]);
    setCustomTag('');
    setClientName('');
    setClientContactNumber('');
    setClientEmail('');
    setClientCompanyName('');
    setClientAddress('');
    setAttachments([]);
    setNewAttachment('');
    setNewSubtasks([]);
    setIsDialogOpen(true);
  };

  const handleAddSubtaskField = () => {
    setNewSubtasks([...newSubtasks, '']);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...newSubtasks];
    updatedSubtasks[index] = value;
    setNewSubtasks(updatedSubtasks);
  };

  const handleAddTask = () => {
    if (!activeColumn || !newTaskContent.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const column = columns[activeColumn];
    
    const adjustedDueDate = newTaskDueDate ? new Date(newTaskDueDate.setHours(23, 59, 59, 999)) : undefined;
    
    const newTask: Task = {
      id: newTaskId,
      content: newTaskContent.trim(),
      priority: newTaskPriority,
      dueDate: adjustedDueDate,
      tags: selectedTags,
      subtasks: newSubtasks.filter(st => st.trim()).map(content => ({
        id: `subtask-${Date.now()}-${Math.random()}`,
        content,
        completed: false
      })),
      clientName: clientName.trim(),
      clientInfo: {
        contactNumber: clientContactNumber.trim(),
        email: clientEmail.trim(),
        companyName: clientCompanyName.trim(),
        address: clientAddress.trim(),
      },
      projectName: projectName.trim(),
      totalCost: parseFloat(totalCost) || 0,
      expenses: expenses,
      assignedTeam: assignedTeam,
      status: status,
      attachments: attachments,
      notes: notes.trim(),
    };

    setColumns(prevColumns => ({
      ...prevColumns,
      [activeColumn]: {
        ...column,
        items: [...column.items, newTask]
      }
    }));

    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "Task added",
      description: "New task has been added to the column",
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleAddSubtask = (taskId: string) => {
    setActiveTaskId(taskId);
    setNewSubtaskContent('');
    setIsSubtaskDialogOpen(true);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      
      for (const columnId in newColumns) {
        const column = newColumns[columnId];
        const taskIndex = column.items.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          const task = column.items[taskIndex];
          const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
          
          if (subtaskIndex !== -1) {
            const updatedSubtasks = [...task.subtasks];
            updatedSubtasks[subtaskIndex] = {
              ...updatedSubtasks[subtaskIndex],
              completed: !updatedSubtasks[subtaskIndex].completed
            };
            
            column.items[taskIndex] = {
              ...task,
              subtasks: updatedSubtasks
            };
          }
          break;
        }
      }
      
      return newColumns;
    });
  };

  const handleEditTask = (columnId: string, taskId: string) => {
    const column = columns[columnId];
    if (!column) return;
    
    const task = column.items.find(item => item.id === taskId);
    if (task) {
      setEditingTask(task);
      setNewTaskContent(task.content);
      setNewTaskPriority(task.priority);
      setNewTaskDueDate(task.dueDate);
      setSelectedTags(task.tags);
      setClientName(task.clientName);
      setClientContactNumber(task.clientInfo?.contactNumber || '');
      setClientEmail(task.clientInfo?.email || '');
      setClientCompanyName(task.clientInfo?.companyName || '');
      setClientAddress(task.clientInfo?.address || '');
      setAttachments(task.attachments || []);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTask = () => {
    if (editingTask && newTaskContent.trim()) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        for (const columnId in newColumns) {
          const column = newColumns[columnId];
          const taskIndex = column.items.findIndex(task => task.id === editingTask.id);
          
          if (taskIndex !== -1) {
            const adjustedDueDate = newTaskDueDate ? 
              new Date(newTaskDueDate.setHours(23, 59, 59, 999)) : undefined;

            column.items[taskIndex] = {
              ...column.items[taskIndex],
              content: newTaskContent.trim(),
              priority: newTaskPriority,
              dueDate: adjustedDueDate,
              tags: selectedTags,
              clientName: clientName.trim(),
              clientInfo: {
                contactNumber: clientContactNumber.trim(),
                email: clientEmail.trim(),
                companyName: clientCompanyName.trim(),
                address: clientAddress.trim(),
              },
              attachments: attachments,
              projectName: projectName.trim(),
            };
            break;
          }
        }
        return newColumns;
      });

      setIsEditDialogOpen(false);
      setEditingTask(null);
      resetForm();
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
    }
  };

  const resetForm = () => {
    setNewTaskContent('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(undefined);
    setSelectedTags([]);
    setCustomTag('');
    setClientName('');
    setClientContactNumber('');
    setClientEmail('');
    setClientCompanyName('');
    setClientAddress('');
    setAttachments([]);
    setNewAttachment('');
    setNewSubtasks([]);
    setTotalCost('');
    setExpenses([]);
    setAssignedTeam([]);
    setStatus('not-started');
    setNotes('');
  };

  const handleAddTeamMember = () => {
    if (newTeamMember.trim()) {
      setAssignedTeam([...assignedTeam, {
        id: `member-${Date.now()}`,
        name: newTeamMember.trim()
      }]);
      setNewTeamMember('');
    }
  };

  const handleAddExpense = () => {
    if (newExpenseDescription.trim() && newExpenseAmount) {
      setExpenses([...expenses, {
        id: `expense-${Date.now()}`,
        description: newExpenseDescription.trim(),
        amount: parseFloat(newExpenseAmount)
      }]);
      setNewExpenseDescription('');
      setNewExpenseAmount('');
    }
  };

  const handleSubtaskSubmit = () => {
    if (activeTaskId && newSubtaskContent.trim()) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        
        for (const columnId in newColumns) {
          const column = newColumns[columnId];
          const taskIndex = column.items.findIndex(task => task.id === activeTaskId);
          
          if (taskIndex !== -1) {
            const task = column.items[taskIndex];
            const newSubtask = {
              id: `subtask-${Date.now()}-${Math.random()}`,
              content: newSubtaskContent.trim(),
              completed: false
            };
            
            column.items[taskIndex] = {
              ...task,
              subtasks: [...task.subtasks, newSubtask]
            };
            break;
          }
        }
        
        return newColumns;
      });

      setIsSubtaskDialogOpen(false);
      setNewSubtaskContent('');
      setActiveTaskId(null);

      toast({
        title: "Subtask added",
        description: "New subtask has been added to the task",
      });
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Project Tasks</h1>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(columns).map(([columnId, column]) => (
              <Column
                key={columnId}
                id={columnId}
                title={column.title}
                cards={column.items}
                onAddTask={() => addTask(columnId)}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
                onEditTask={handleEditTask}
                onToggleExpand={(taskId) => {
                  setColumns(prev => {
                    const newColumns = { ...prev };
                    const task = newColumns[columnId].items.find(item => item.id === taskId);
                    if (task) {
                      task.isExpanded = !task.isExpanded;
                    }
                    return newColumns;
                  });
                }}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Fill in the project details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Client Information</Label>
              <div className="grid gap-4">
                <Input
                  placeholder="Contact Number"
                  value={clientContactNumber}
                  onChange={(e) => setClientContactNumber(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Input
                  placeholder="Company Name"
                  value={clientCompanyName}
                  onChange={(e) => setClientCompanyName(e.target.value)}
                />
                <Textarea
                  placeholder="Client Address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add file or document link"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                />
                <Button type="button" onClick={handleAddAttachment}>Add</Button>
              </div>
              {attachments.map((attachment, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{attachment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Task Description</Label>
              <Input
                id="task"
                placeholder="Enter task description"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Status</Label>
              <RadioGroup
                value={status}
                onValueChange={(value: 'not-started' | 'in-progress' | 'completed') => setStatus(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-started" id="not-started" />
                  <Label htmlFor="not-started">Not Started</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in-progress" id="in-progress" />
                  <Label htmlFor="in-progress">In Progress</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">Completed</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={newTaskPriority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTaskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={(date) => {
                      if (date) {
                        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                        setNewTaskDueDate(endOfDay);
                      } else {
                        setNewTaskDueDate(undefined);
                      }
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost">Project Total Cost</Label>
              <Input
                id="totalCost"
                type="number"
                placeholder="Enter total cost"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Expenses</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Expense description"
                  value={newExpenseDescription}
                  onChange={(e) => setNewExpenseDescription(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                />
                <Button type="button" onClick={handleAddExpense}>Add</Button>
              </div>
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{expense.description}</span>
                  <span>${expense.amount}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter team member name"
                  value={newTeamMember}
                  onChange={(e) => setNewTeamMember(e.target.value)}
                />
                <Button type="button" onClick={handleAddTeamMember}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignedTeam.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {member.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setAssignedTeam(assignedTeam.filter(m => m.id !== member.id))}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes & Comments</Label>
              <Textarea
                placeholder="Add notes or comments"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddCustomTag}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtasks</Label>
              {newSubtasks.map((subtask, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={subtask}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubtaskField}
                className="w-full"
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Add Subtask
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask">Subtask Description</Label>
              <Input
                id="subtask"
                placeholder="Enter subtask description"
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubtaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubtaskSubmit}>Add Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Client Information</Label>
              <div className="grid gap-4">
                <Input
                  placeholder="Contact Number"
                  value={clientContactNumber}
                  onChange={(e) => setClientContactNumber(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Input
                  placeholder="Company Name"
                  value={clientCompanyName}
                  onChange={(e) => setClientCompanyName(e.target.value)}
                />
                <Textarea
                  placeholder="Client Address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add file or document link"
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                />
                <Button type="button" onClick={handleAddAttachment}>Add</Button>
              </div>
              {attachments.map((attachment, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{attachment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Task Description</Label>
              <Input
                id="task"
                placeholder="Enter task description"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={newTaskPriority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTaskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={(date) => {
                      if (date) {
                        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                        setNewTaskDueDate(endOfDay);
                      } else {
                        setNewTaskDueDate(undefined);
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddCustomTag}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingTask(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanBoard;
