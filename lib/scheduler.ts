/**
 * Simple scheduler utility to manage periodic tasks
 * This avoids the need for external cron jobs by using in-memory scheduling
 */

type ScheduledTask = {
  id: string;
  name: string;
  interval: number; // in milliseconds
  lastRun: number;
  fn: () => Promise<void>;
};

class Scheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start the scheduler when the module is imported
    this.start();
  }

  /**
   * Register a new task with the scheduler
   */
  register(id: string, name: string, intervalHours: number, fn: () => Promise<void>): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.tasks.set(id, {
      id,
      name,
      interval: intervalMs,
      lastRun: 0, // Never run initially
      fn,
    });

    console.log(`Registered task: ${name} (runs every ${intervalHours} hours)`);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Check for tasks to run every minute
    this.checkInterval = setInterval(() => this.checkTasks(), 60 * 1000);

    console.log("Scheduler started");
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log("Scheduler stopped");
  }

  /**
   * Check for tasks that need to be run
   */
  private async checkTasks(): Promise<void> {
    const now = Date.now();

    for (const task of this.tasks.values()) {
      const timeSinceLastRun = now - task.lastRun;

      // If the task has never run or it's time to run again
      if (task.lastRun === 0 || timeSinceLastRun >= task.interval) {
        console.log(`Running scheduled task: ${task.name}`);

        try {
          // Update lastRun before executing to prevent concurrent executions
          task.lastRun = now;
          await task.fn();
          console.log(`Task completed: ${task.name}`);
        } catch (error) {
          console.error(`Error running task ${task.name}:`, error);
        }
      }
    }
  }

  /**
   * Force a task to run immediately
   */
  runTaskNow(id: string): Promise<void> {
    const task = this.tasks.get(id);

    if (!task) {
      return Promise.reject(new Error(`Task with id ${id} not found`));
    }

    console.log(`Manually running task: ${task.name}`);
    task.lastRun = Date.now();
    return task.fn();
  }
}

// Create a singleton instance
const scheduler = new Scheduler();

export default scheduler;
