import pino from 'pino';
import type { LoggerOptions } from 'pino';

/**
 * 환경에 따른 로거 설정
 * 운영 환경(production): JSON 포맷으로 출력 (ELK, CloudWatch 등 수집 용이)
 * 개발 환경(development): pino-pretty를 사용하여 가독성 높은 포맷으로 출력
 */
const isProduction = process.env.NODE_ENV === 'production';

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
};

if (!isProduction) {
    options.transport = {
        target: 'pino-pretty',
        options: {
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            colorize: true,
        },
    };
}

export const logger = pino(options);

logger.info(`Logger initialized in ${process.env.NODE_ENV || 'development'} mode`);
