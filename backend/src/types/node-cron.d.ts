declare module 'node-cron' {
  function schedule(expression: string, func: () => void, options?: any): any;
  function validate(expression: string): boolean;
  export { schedule, validate };
}
