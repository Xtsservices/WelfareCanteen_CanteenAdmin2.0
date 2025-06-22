export class DateUtils {
    static formatDateTime(timestamp: number): string {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    }
  
    static formatDate(timestamp: number): string {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString();
    }
  
    static formatTime(timestamp: number): string {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString();
    }
  }