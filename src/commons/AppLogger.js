import * as winston from 'winston';
import 'winston-daily-rotate-file';

const formatStdout = winston.format.printf(({
  level,
  message,
  timestamp,
}) => `${timestamp} ${level}: ${message}`);

const logOptions = {
  logPath: '/jtqa/logs',
  logDir: './jtqa-logs',
  logAppName: 'JTQA',
  logDisableConsole: false,
  logDisableFileRotate: true,
};

const AppLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    !logOptions.logDisableConsole ?
      new winston.transports.Console({
        name: 'console',
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }) :
      null,
    !logOptions.logDisableFileRotate ?
      new winston.transports.DailyRotateFile({
        format: winston.format.combine(
          winston.format.timestamp(),
          formatStdout
        ),
        dirname: logOptions.logDir,
        filename: `${logOptions.logAppName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '1d',
      }) :
      null,
  ].filter((item) => item),
});

AppLogger.transports.forEach(
  (transport) => {
    if (transport?.name === 'console') {
      transport.silent = logOptions.logDisableConsole;
    } else if (transport?.options?.dirname !== null &&
        transport?.options?.filename !== null) {
      transport.silent = logOptions.logDisableFileRotate;
    }
  }
);

export default AppLogger;
