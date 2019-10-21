const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}


const favouriteBlog = (blogs) => {
 
  if (blogs.length === 0){
    return null
  } else {
    let maxLikes = 0
    let favBlog = blogs[0]

    blogs.forEach( (blog, i) => {
      if (Number(blog.likes) > maxLikes){
        maxLikes = blog.likes
        favBlog = blog
      }
    })

    return favBlog
  }
  
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}

