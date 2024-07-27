import { addLogo } from '../media-service.js'
import { saveLogo } from '../../persistence/media-persistence.js'
import logger from '../../logger.js'

jest.mock('../../persistence/media-persistence.js')
jest.mock('../../logger.js', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logFilePath: 'test/path',
}))

jest.mock('electron', () => ({
    app: {
        getPath: jest.fn(() => 'test/path'),
    },
}))

describe('MediaServiceTests', function () {
    describe('addLogo', function () {
        it('should fail when a non base64 encoded string is passed', function () {
            const nonBase64String = 'non base64 string'
            const expectedErrorMessage = 'Invalid base64 string'

            expect.assertions(2)
            return addLogo(nonBase64String).catch((e) => {
                expect(e).toEqual(expectedErrorMessage)
                expect(logger.error).toHaveBeenCalledWith(expectedErrorMessage)
            })
        })

        it('should fail when an invalid file type is passed', function () {
            const invalidFileType = 'data:image/bmp;base64,invalid'
            const expectedErrorMessage = 'Invalid file type'

            expect.assertions(2)
            return addLogo(invalidFileType).catch((e) => {
                expect(e).toEqual(expectedErrorMessage)
                expect(logger.error).toHaveBeenCalledWith(expectedErrorMessage)
            })
        })

        it('should succeed when a valid base64 encoded image string is passed', function () {
            const validBase64String = 'data:image/png;base64,valid'
            const expectedFilePath = 'path/to/file.png'
            saveLogo.mockReturnValue(expectedFilePath)

            expect.assertions(1)
            return addLogo(validBase64String).then((filePath) => {
                expect(filePath).toEqual(expectedFilePath)
            })
        })
    })
})
