import { celebrate } from 'celebrate';
import { Router } from 'express';
import * as fileControllers from '../controllers/fileController.js';
import * as fileUploadControllers from '../controllers/fileUploadController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createFileSchema,
  createFileUploadSignedUrlSchema,
  deleteFileSchema,
  getFileByIdSchema,
  getFilesSchema,
  updateFileSchema,
} from '../validations/files.js';

const router = Router();

router.post(
  '/',
  celebrate(createFileSchema),
  ctrlWrapper(fileControllers.createFileController),
);
router.get(
  '/',
  celebrate(getFilesSchema),
  ctrlWrapper(fileControllers.getAllFilesController),
);
router.post(
  '/upload-url',
  celebrate(createFileUploadSignedUrlSchema),
  ctrlWrapper(fileUploadControllers.createFileUploadSignedUrlController),
);
router.get(
  '/:fileId',
  celebrate(getFileByIdSchema),
  ctrlWrapper(fileControllers.getFileByIdController),
);
router.patch(
  '/:fileId',
  celebrate(updateFileSchema),
  ctrlWrapper(fileControllers.updateFileController),
);
router.delete(
  '/:fileId',
  celebrate(deleteFileSchema),
  ctrlWrapper(fileControllers.deleteFileController),
);

export default router;
