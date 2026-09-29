import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '@core/config/app-config';
import { ConsoleLogger } from './console-logger';
import { LogLevel } from './logger';

describe('ConsoleLogger', () => {
  let debug: jasmine.Spy;
  let info: jasmine.Spy;
  let warn: jasmine.Spy;
  let error: jasmine.Spy;

  beforeEach(() => {
    debug = spyOn(console, 'debug');
    info = spyOn(console, 'info');
    warn = spyOn(console, 'warn');
    error = spyOn(console, 'error');
  });

  function loggerAt(logLevel: LogLevel): ConsoleLogger {
    TestBed.configureTestingModule({
      providers: [
        ConsoleLogger,
        { provide: APP_CONFIG, useValue: { appName: 'Test', production: false, logLevel } }
      ]
    });
    return TestBed.inject(ConsoleLogger);
  }

  function logEverything(logger: ConsoleLogger): void {
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
  }

  it('writes every level when the threshold is debug', () => {
    logEverything(loggerAt('debug'));

    expect([debug, info, warn, error].map((spy) => spy.calls.count())).toEqual([1, 1, 1, 1]);
  });

  it('drops messages below the threshold', () => {
    logEverything(loggerAt('warn'));

    expect([debug, info, warn, error].map((spy) => spy.calls.count())).toEqual([0, 0, 1, 1]);
  });

  it('passes the context along with the message', () => {
    loggerAt('debug').error('failed', { errorId: 'abc' });

    expect(error).toHaveBeenCalledOnceWith('failed', { errorId: 'abc' });
  });
});
