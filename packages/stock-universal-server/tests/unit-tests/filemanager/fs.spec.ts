import { appendBody } from '../../../src/filemanager/fs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('appendBody', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {
        data: '{"foo": "bar"}'
      },
      files: {
        profilePic: [
          {
            originalname: 'profile.jpg',
            filename: 'profile123.jpg',
            mimetype: 'image/jpeg',
            size: 1024
          }
        ],
        coverPic: [
          {
            originalname: 'cover.jpg',
            filename: 'cover123.jpg',
            mimetype: 'image/jpeg',
            size: 2048
          }
        ],
        photos: [
          {
            originalname: 'photo1.jpg',
            filename: 'photo123.jpg',
            mimetype: 'image/jpeg',
            size: 3072
          },
          {
            originalname: 'photo2.jpg',
            filename: 'photo456.jpg',
            mimetype: 'image/jpeg',
            size: 4096
          }
        ],
        videos: [
          {
            originalname: 'video1.mp4',
            filename: 'video123.mp4',
            mimetype: 'video/mp4',
            size: 5120
          },
          {
            originalname: 'video2.mp4',
            filename: 'video456.mp4',
            mimetype: 'video/mp4',
            size: 6144
          }
        ],
        videothumbnail: [
          {
            originalname: 'thumbnail.jpg',
            filename: 'thumbnail123.jpg',
            mimetype: 'image/jpeg',
            size: 7168
          }
        ]
      },
      user: {
        userId: '123',
        companyId: '456'
      }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    };

    next = vi.fn();
  });

  it('should append files to the request body', () => {
    appendBody(req, res, next);

    expect(req.body.parsed).toBeDefined();
    expect(req.body.parsed.profilePic).toEqual({
      userOrCompanayId: '123',
      name: 'profile.jpg',
      url: '/openphotos/profile123.jpg',
      type: 'image/jpeg',
      version: '',
      storageDir: 'openphotos',
      size: 1024
    });
    expect(req.body.parsed.coverPic).toEqual({
      userOrCompanayId: '123',
      name: 'cover.jpg',
      url: '/openphotos/cover123.jpg',
      type: 'image/jpeg',
      version: '',
      storageDir: 'openphotos',
      size: 2048
    });
    expect(req.body.parsed.newFiles).toEqual([
      {
        userOrCompanayId: '123',
        name: 'photo1.jpg',
        url: '/openphotos/photo123.jpg',
        type: 'image/jpeg',
        version: '',
        storageDir: 'openphotos',
        size: 3072
      },
      {
        userOrCompanayId: '123',
        name: 'photo2.jpg',
        url: '/openphotos/photo456.jpg',
        type: 'image/jpeg',
        version: '',
        storageDir: 'openphotos',
        size: 4096
      },
      {
        userOrCompanayId: '123',
        name: 'video1.mp4',
        url: '/openvideos/video123.mp4',
        type: 'video/mp4',
        version: '',
        storageDir: 'openvideos',
        size: 5120
      },
      {
        userOrCompanayId: '123',
        name: 'video2.mp4',
        url: '/openvideos/video456.mp4',
        type: 'video/mp4',
        version: '',
        storageDir: 'openvideos',
        size: 6144
      }
    ]);
    expect(req.body.parsed.thumbnail).toEqual({
      userOrCompanayId: '123',
      name: 'thumbnail.jpg',
      url: '/openphotos/thumbnail123.jpg',
      type: 'image/jpeg',
      version: '',
      storageDir: 'openphotos',
      size: 7168
    });
  });

  it('should return 404 if no files are present', () => {
    req.files = null;
    appendBody(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ success: false });
    expect(next).not.toHaveBeenCalled();
  });

  // Add more test cases as needed
});
