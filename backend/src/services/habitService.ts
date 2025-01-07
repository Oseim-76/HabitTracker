import {pool} from '../config/database';
import {format} from 'date-fns';
import {AppError} from '../middleware/errorHandler';

export class HabitService {
  static async getTodayHabits(userId: string) {
    try {
      console.log('Getting habits for user:', userId);
      
      // First, verify the tables exist
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'habits'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        throw new Error('Habits table does not exist');
      }

      const {rows} = await pool.query(
        `SELECT h.*, 
          hc.completed_date IS NOT NULL as is_completed,
          hs.current_streak,
          hs.longest_streak
        FROM habits h
        LEFT JOIN habit_completions hc 
          ON h.id = hc.habit_id 
          AND hc.completed_date = CURRENT_DATE
        LEFT JOIN habit_streaks hs
          ON h.id = hs.habit_id
        WHERE h.user_id = $1
        ORDER BY h.scheduled_time ASC`,
        [userId]
      );
      
      console.log('Query result:', rows);
      return rows;
    } catch (error) {
      console.error('Error in getTodayHabits:', error);
      if (error instanceof Error) {
        throw new AppError(500, `Failed to fetch habits: ${error.message}`);
      }
      throw new AppError(500, 'Failed to fetch habits');
    }
  }

  static async createHabit(userId: string, habitData: any) {
    const {name, description, frequency, timeOfDay, scheduledTime} = habitData;

    const {rows} = await pool.query(
      `INSERT INTO habits (
        user_id, name, description, frequency, 
        time_of_day, scheduled_time
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [userId, name, description, frequency, timeOfDay, scheduledTime]
    );

    await pool.query(
      `INSERT INTO habit_streaks (habit_id) VALUES ($1)`,
      [rows[0].id]
    );

    return rows[0];
  }

  static async updateHabit(habitId: string, userId: string, updates: any) {
    const {rows} = await pool.query(
      `UPDATE habits
      SET name = $1, description = $2, frequency = $3,
          time_of_day = $4, scheduled_time = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *`,
      [
        updates.name,
        updates.description,
        updates.frequency,
        updates.timeOfDay,
        updates.scheduledTime,
        habitId,
        userId,
      ]
    );

    if (!rows[0]) {
      throw new AppError(404, 'Habit not found');
    }

    return rows[0];
  }

  static async deleteHabit(habitId: string, userId: string) {
    const {rowCount} = await pool.query(
      `DELETE FROM habits
      WHERE id = $1 AND user_id = $2`,
      [habitId, userId]
    );

    if (!rowCount) {
      throw new AppError(404, 'Habit not found');
    }
  }

  static async toggleHabit(habitId: string, userId: string, date: string) {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify habit belongs to user
      const {rows: [habit]} = await client.query(
        `SELECT * FROM habits WHERE id = $1 AND user_id = $2`,
        [habitId, userId]
      );

      if (!habit) {
        throw new AppError(404, 'Habit not found');
      }

      // Check if already completed today
      const {rows} = await client.query(
        `SELECT * FROM habit_completions
        WHERE habit_id = $1 AND completed_date = $2`,
        [habitId, date]
      );

      let result;
      if (rows.length > 0) {
        // Remove completion
        await client.query(
          `DELETE FROM habit_completions
          WHERE habit_id = $1 AND completed_date = $2`,
          [habitId, date]
        );
      } else {
        // Add completion
        await client.query(
          `INSERT INTO habit_completions (habit_id, completed_date)
          VALUES ($1, $2)`,
          [habitId, date]
        );
      }

      // Update streaks
      const streaks = await this.calculateStreaks(client, habitId);
      
      await client.query('COMMIT');
      return streaks;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static async calculateStreaks(client: any, habitId: string) {
    const {rows} = await client.query(
      `SELECT completed_date
      FROM habit_completions
      WHERE habit_id = $1
      ORDER BY completed_date DESC`,
      [habitId]
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let currentCount = 0;

    for (let i = 0; i < rows.length; i++) {
      if (i === 0 || 
          format(new Date(rows[i].completed_date), 'yyyy-MM-dd') ===
          format(new Date(rows[i - 1].completed_date).setDate(
            new Date(rows[i - 1].completed_date).getDate() - 1
          ), 'yyyy-MM-dd')) {
        currentCount++;
        if (currentCount > longestStreak) {
          longestStreak = currentCount;
        }
      } else {
        currentCount = 1;
      }
    }

    currentStreak = currentCount;

    await client.query(
      `UPDATE habit_streaks
      SET current_streak = $1, longest_streak = $2
      WHERE habit_id = $3`,
      [currentStreak, longestStreak, habitId]
    );

    return {currentStreak, longestStreak};
  }

  static async getHabitStats(habitId: string, userId: string) {
    const {rows} = await pool.query(
      `SELECT 
        h.*,
        hs.current_streak,
        hs.longest_streak,
        COUNT(hc.id) as total_completions
      FROM habits h
      LEFT JOIN habit_streaks hs ON h.id = hs.habit_id
      LEFT JOIN habit_completions hc ON h.id = hc.habit_id
      WHERE h.id = $1 AND h.user_id = $2
      GROUP BY h.id, hs.current_streak, hs.longest_streak`,
      [habitId, userId]
    );

    if (!rows[0]) {
      throw new AppError(404, 'Habit not found');
    }

    return {
      currentStreak: rows[0].current_streak || 0,
      longestStreak: rows[0].longest_streak || 0,
      totalCompletions: parseInt(rows[0].total_completions) || 0,
    };
  }
} 