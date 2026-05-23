import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import mongoose from 'mongoose';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Schema Definition for MongoDB
const MenuItemSchema = new mongoose.models.MenuItem || mongoose.model('MenuItem', new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  modelUrl: String,
  tenantId: String,
}));

export async function POST(request) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const tenantId = formData.get('tenantId');
    const file = formData.get('modelFile');

    let modelUrl = '';

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save 3D model file directly to VPS public folder
      const filename = `${Date.now()}-${file.name}`;
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      modelUrl = `/uploads/${filename}`; // Public URL hosted from your VPS
    }

    const newItem = await mongoose.model('MenuItem').create({
      name, description, price: parseFloat(price), category, tenantId, modelUrl
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    
    const items = await mongoose.model('MenuItem').find({ tenantId });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  }
    
