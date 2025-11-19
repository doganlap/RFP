import React, { useState, useEffect } from 'react';

// Task Management Component for RFP Process
export const TaskManagement = ({ rfpId, currentState }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    due_date: '',
    priority: 'medium'
  });

  // Generate tasks based on current RFP state
  useEffect(() => {
    const generateTasks = (state) => {
      const taskTemplates = {
        intake: [
          { title: 'Review RFP documents', assignee: 'Sales Rep', priority: 'high', days: 1 },
          { title: 'Initial client contact', assignee: 'Sales Rep', priority: 'medium', days: 2 }
        ],
        go_no_go: [
          { title: 'Complete scoring assessment', assignee: 'Sales Manager', priority: 'high', days: 1 },
          { title: 'Review competitive landscape', assignee: 'Business Analyst', priority: 'medium', days: 2 }
        ],
        planning: [
          { title: 'Assign team members', assignee: 'Pre-Sales Lead', priority: 'high', days: 1 },
          { title: 'Create project timeline', assignee: 'PMO', priority: 'medium', days: 2 },
          { title: 'Generate RACI matrix', assignee: 'Pre-Sales Lead', priority: 'low', days: 1 }
        ],
        solutioning: [
          { title: 'Draft technical architecture', assignee: 'Solution Architect', priority: 'high', days: 5 },
          { title: 'Map compliance requirements', assignee: 'Compliance Officer', priority: 'high', days: 3 },
          { title: 'Build Bill of Quantities', assignee: 'Solution Architect', priority: 'medium', days: 4 }
        ],
        pricing: [
          { title: 'Develop cost model', assignee: 'Pricing Analyst', priority: 'high', days: 3 },
          { title: 'Calculate margins', assignee: 'Finance Manager', priority: 'high', days: 2 },
          { title: 'Request discount approvals', assignee: 'Sales Manager', priority: 'medium', days: 1 }
        ],
        proposal_build: [
          { title: 'Write technical volume', assignee: 'Proposal Writer', priority: 'high', days: 7 },
          { title: 'Compile commercial volume', assignee: 'Pricing Analyst', priority: 'high', days: 3 },
          { title: 'Create executive summary', assignee: 'Pre-Sales Lead', priority: 'medium', days: 2 },
          { title: 'Complete QA checklist', assignee: 'Quality Reviewer', priority: 'high', days: 1 }
        ],
        approvals: [
          { title: 'Technical review and signoff', assignee: 'Pre-Sales Lead', priority: 'high', days: 2 },
          { title: 'Financial review and approval', assignee: 'Finance Manager', priority: 'high', days: 2 },
          { title: 'Legal review and clearance', assignee: 'Legal Counsel', priority: 'high', days: 3 },
          { title: 'Compliance final check', assignee: 'Compliance Officer', priority: 'medium', days: 1 }
        ],
        submission: [
          { title: 'Package final documents', assignee: 'Proposal Writer', priority: 'high', days: 1 },
          { title: 'Submit via client portal', assignee: 'Sales Rep', priority: 'high', days: 1 },
          { title: 'Confirm receipt', assignee: 'Sales Rep', priority: 'medium', days: 1 }
        ]
      };

      const templates = taskTemplates[state] || [];
      const today = new Date();
      
      return templates.map((template, index) => ({
        id: `${state}-${index}`,
        title: template.title,
        assignee: template.assignee,
        due_date: new Date(today.getTime() + template.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: template.priority,
        status: 'todo',
        created_at: new Date().toISOString()
      }));
    };

    setTasks(generateTasks(currentState));
  }, [currentState]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: `custom-${Date.now()}`,
      ...newTask,
      status: 'todo',
      created_at: new Date().toISOString()
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', assignee: '', due_date: '', priority: 'medium' });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

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
        <h2 className="text-xl font-semibold">Task Management</h2>
        <div className="text-sm text-gray-500">
          {tasks.filter(t => t.status === 'done').length} of {tasks.length} completed
        </div>
      </div>

      {/* Add New Task */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">Add New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Assignee"
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
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <button
          onClick={addTask}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
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
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
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
