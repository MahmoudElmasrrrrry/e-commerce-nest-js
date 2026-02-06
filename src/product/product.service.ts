import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Category } from 'src/category/category.schema';
import { SubCategory } from 'src/sub-category/sub-category.schema';
import { Brand } from 'src/brand/brand.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const productExist = await this.productModel.findOne({
      title: createProductDto.title,
    });
    if (productExist) {
      throw new BadRequestException('Product already exist');
    }

    const category = await this.categoryModel.findById(
      createProductDto.category,
    );
    if (!category) {
      throw new BadRequestException('Category Not Found');
    }
    const subCategory = await this.subCategoryModel.findById(
      createProductDto.subCategory,
    );
    if (!subCategory) {
      throw new BadRequestException('Sub-Category Not Found');
    }

    const brand = await this.brandModel.findById(createProductDto.brand);
    if (!brand) {
      throw new BadRequestException('brand Not Found');
    }

    const slug = slugify(createProductDto.title, { lower: true });

    const newProduct = await this.productModel.create({
      ...createProductDto,
      slug,
    });
    await newProduct.populate('category subCategory brand', '-__v');
    return {
      status: 'success',
      message: 'Product created successfully',
      data: newProduct,
    };
  }

  async findAll(query: any) {
    // 1) filter
    let requestQuery = { ...query };
    const removeQuery = [
      'page',
      'limit',
      'sort',
      'keyword',
      'category',
      'fields',
    ];

    removeQuery.forEach((singleQuery) => {
      delete requestQuery[singleQuery];
    });

    requestQuery = JSON.parse(
      JSON.stringify(requestQuery).replace(
        /\b(gte|lte|gt|lt)\b/g,
        (match) => `$${match}`,
      ),
    );

    // 2) pagination
    const page = query?.page || 1;
    const limit = query?.limit || 5;
    const skip = (page - 1) * limit;

    // 3) sorting
    let sort = query?.sort || 'asc';
    if (!['asc', 'desc'].includes(sort)) {
      throw new HttpException('Sort must be either asc or desc', 400);
    }

    // 4) fields
    let fields = query?.fields || '';
    fields = fields.split(',').join(' ');

    // 5) search
    let findData = { ...requestQuery };

    if (query.keyword) {
      findData.$or = [
        { title: { $regex: query.keyword } },
        { description: { $regex: query.keyword } },
      ];
    }

    if (query.category) {
      findData.category = query.category.toString();
    }

    const products = await this.productModel
      .find(findData)
      .limit(limit)
      .skip(skip)
      .sort({ title: sort })
      .select(fields);

    return {
      status: 'success',
      message: 'Products retrieved successfully',
      length: products.length,
      data: products,
    };
  }

  async findOne(id: Types.ObjectId) {
    const product = await this.productModel
      .findById(id)
      .select('-__v')
      .populate('category subCategory brand', '-__v');

    if (!product) {
      throw new NotFoundException('Procut Not Found');
    }

    return {
      status: 'success',
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async update(id: Types.ObjectId, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException('Product Not Found');
    }

    if (updateProductDto.category) {
      const category = await this.categoryModel.findById(
        updateProductDto.category,
      );
      if (!category) {
        throw new BadRequestException('Category Not Found');
      }
    }
    if (updateProductDto.subCategory) {
      const subCategory = await this.subCategoryModel.findById(
        updateProductDto.subCategory,
      );
      if (!subCategory) {
        throw new BadRequestException('Sub-Category Not Found');
      }
    }

    if (updateProductDto.brand) {
      const brand = await this.brandModel.findById(updateProductDto.brand);
      if (!brand) {
        throw new BadRequestException('brand Not Found');
      }
    }
    let slug = ''
    if(updateProductDto.title){
      if(updateProductDto.title === product.title){
        throw new BadRequestException('You create the same title, change title please.')
      }
      slug = slugify(updateProductDto.title, {lower: true});
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, slug },
        {
          new: true,
          runValidators: true,
        },
      )
      .select('-__v')
      .populate('category subCategory brand', '-__v');

    return {
      status: 'success',
      message: 'product updated successfully',
      data: updatedProduct,
    };
  }

  async remove(id: Types.ObjectId) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('product Not Found');
    }

    await this.productModel.findByIdAndDelete(id);

    return {
      status: 'success',
      message: 'Product deleted successfully',
      data: null,
    };
  }
}
