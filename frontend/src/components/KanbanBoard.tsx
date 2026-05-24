import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api';
import type { Task } from '../api';
import { 
  Plus, Search, Trash2, Calendar, 
  ArrowLeft, ArrowRight, X, AlertTriangle, 
  Loader2, Filter, CheckSquare
} from 'lucide-react';

type StatusType = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

interface Column {
  id: StatusType;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-indigo-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-cyan-400' },
  { id: 'REVIEW', title: 'Review', color: 'bg-amber-400' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-400' },
];

export const KanbanBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [status, setStatus] = useState<StatusType>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getTasks,
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      closeModal();
    },
  });

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => 
      taskApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      closeModal();
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  const openCreateModal = (defaultStatus: StatusType = 'TODO') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus(defaultStatus);
    setDueDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    const taskPayload = {
      title,
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, updates: taskPayload });
    } else {
      createTaskMutation.mutate(taskPayload);
    }
  };

  const moveTask = (task: Task, direction: 'prev' | 'next') => {
    const statusOrder: StatusType[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = statusOrder.indexOf(task.status);
    let nextIndex = currentIndex;

    if (direction === 'prev' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex !== currentIndex) {
      updateTaskMutation.mutate({
        id: task.id,
        updates: { status: statusOrder[nextIndex] },
      });
    }
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  // Filter tasks based on search & priority selectors
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getTasksByStatus = (statusId: StatusType) => {
    return filteredTasks.filter(task => task.status === statusId);
  };

  const isOverdue = (dueDateStr: string | null, taskStatus: string) => {
    if (!dueDateStr || taskStatus === 'DONE') return false;
    return new Date(dueDateStr) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar: Title & Create Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Task Board</h2>
          <p className="text-slate-400 mt-1">Manage project pipelines and team execution states.</p>
        </div>
        <button 
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setPriorityFilter(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  priorityFilter === level
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board Columns Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-h-[500px]">
                {/* Column Title */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.color}`}></span>
                    <h3 className="font-bold text-slate-200 text-sm">{column.title}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => openCreateModal(column.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column Tasks List */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="group glass p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative"
                      onClick={() => openEditModal(task)}
                    >
                      {/* Priority Tag & Actions */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        {/* Quick Status Shift Buttons & Delete */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          {column.id !== 'TODO' && (
                            <button 
                              onClick={() => moveTask(task, 'prev')}
                              className="p-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                              title="Move Left"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {column.id !== 'DONE' && (
                            <button 
                              onClick={() => moveTask(task, 'next')}
                              className="p-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                              title="Move Right"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
                            title="Delete Task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-semibold text-slate-100 text-sm leading-snug group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Due Date & Overdue label */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                          <Calendar className={`h-3.5 w-3.5 ${isOverdue(task.dueDate, task.status) ? 'text-rose-400' : 'text-slate-500'}`} />
                          <span className={`text-[11px] font-medium ${isOverdue(task.dueDate, task.status) ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl p-6 text-center">
                      <CheckSquare className="h-6 w-6 text-slate-600 mb-1" />
                      <p className="text-slate-500 text-xs">No tasks in column</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Provide task details or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm transition-all resize-none"
                />
              </div>

              {/* Grid: Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#101118] border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#101118] border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101118] border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm flex items-center gap-2"
                >
                  {(createTaskMutation.isPending || updateTaskMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
