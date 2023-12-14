const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}


const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}


const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const maxLikesBlog = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])
  return {
    title: maxLikesBlog.title,
    author: maxLikesBlog.author,
    likes: maxLikesBlog.likes
  }
}


const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  // Use Lodash to group blogs by author and then find the author with the most blogs
  const blogsByAuthor = lodash.groupBy(blogs, 'author')
  const topAuthor = lodash.maxBy(Object.keys(blogsByAuthor), (author) => blogsByAuthor[author].length)
  return {
    author: topAuthor,
    blogs: blogsByAuthor[topAuthor].length,
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  // Use Lodash to group blogs by author and then sum the likes for each author
  const blogsByAuthor = lodash.groupBy(blogs, 'author')
  const likesByAuthor = lodash.mapValues(blogsByAuthor, (authorBlogs) => lodash.sumBy(authorBlogs, 'likes'))
  // Find the author with the most likes
  const topAuthor = lodash.maxBy(Object.keys(likesByAuthor), (author) => likesByAuthor[author])
  return {
    author: topAuthor,
    likes: likesByAuthor[topAuthor]
  }
}


module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}