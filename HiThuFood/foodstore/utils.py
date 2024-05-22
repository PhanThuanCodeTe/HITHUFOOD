import cloudinary

#hàm trả về hình ảnh trên cloudinary, với Image ID là tên hình ảnh
def get_default_avatar_url():
    default_avatar = cloudinary.CloudinaryImage('avatar-trang-4_oe9hyo')
    return default_avatar.build_url()

