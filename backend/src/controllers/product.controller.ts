import { Request, Response, NextFunction } from 'express';
import { Product, Seller } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 12, category, state, minPrice, maxPrice, minRating, search, sort = '-createdAt', sellerId } = req.query;

    const filter: Record<string, any> = { isApproved: true, isActive: true };
    if (category) filter.category = category;
    if (state) filter.state = state;
    if (sellerId) filter.sellerId = sellerId;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (search) filter.$text = { $search: search as string };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortStr = sort as string;
    const sortObj: Record<string, 1 | -1> = {};
    if (sortStr.startsWith('-')) {
      sortObj[sortStr.slice(1)] = -1;
    } else {
      sortObj[sortStr] = 1;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('sellerId', 'businessName isVerified rating state')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum, limit: limitNum, total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'businessName isVerified rating state address totalSales');
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    if (!seller) throw new AppError('Seller profile required', 403);
    if (!seller.isVerified) throw new AppError('Seller not verified yet', 403);

    const images = (req.files as Express.Multer.File[])?.map((f: any) => f.path) || [];
    const product = await Product.create({ ...req.body, sellerId: seller._id, images, state: seller.state });
    res.status(201).json({ success: true, message: 'Product submitted for approval', data: product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    const product = await Product.findOne({ _id: req.params.id, sellerId: seller?._id });
    if (!product) throw new AppError('Product not found or unauthorized', 404);

    const images = (req.files as Express.Multer.File[])?.map((f: any) => f.path);
    if (images?.length) req.body.images = images;
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findOne({ userId: req.user!._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller?._id });
    if (!product) throw new AppError('Product not found or unauthorized', 404);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};
