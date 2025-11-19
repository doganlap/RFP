import React, { useState, useEffect } from 'react';
import { apiClient as ApiClient } from './services/ApiClient';
import { useTranslation } from 'react-i18next';

// Task Management Component for RFP Process
export const TaskManagement = ({ rfpId, currentState }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    due_date: '',
    priority: 'medium'
  });

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await ApiClient.getTasks(rfpId);
        if (response && response.data) {
          setTasks(Array.isArray(response.data) ? response.data : []);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (rfpId) {
      fetchTasks();
    }
  }, [rfpId]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        ...newTask,
        rfpId,
        status: 'todo'
      };
      const response = await ApiClient.createTask(taskData);
      if (response && response.data) {
        setTasks([...tasks, response.data]);
        setNewTask({ title: '', assignee: '', due_date: '', priority: 'medium' });
      }
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Failed to add task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await ApiClient.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-600">{t('loading_tasks')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    blocked: tasks.filter(t => t.status === 'blocked'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('task_management')}</h2>
        <div className="text-sm text-gray-500">
          {tasks.filter(t => t.status === 'done').length} {t('of')} {tasks.length} {t('completed')}
        </div>
      </div>

      {/* Add New Task */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">{t('add_new_task')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder={t('task_title')}
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder={t('assignee')}
            value={newTask.assignee}
            onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="date"
            value={newTask.due_date}
            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="low">{t('low_priority')}</option>
            <option value="medium">{t('medium_priority')}</option>
            <option value="high">{t('high_priority')}</option>
          </select>
        </div>
        <button
          onClick={addTask}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {t('add_task')}
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 capitalize">
              {status.replace('_', ' ')} ({statusTasks.length})
            </h3>
            <div className="space-y-3">
              {statusTasks.map(task => (
                <div key={task.id} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">👤 {task.assignee}</p>
                  <p className="text-xs text-gray-500 mb-3">📅 {task.due_date}</p>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="todo">{t('to_do')}</option>
                    <option value="in_progress">{t('in_progress')}</option>
                    <option value="blocked">{t('blocked')}</option>
                    <option value="done">{t('done')}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManagement;
