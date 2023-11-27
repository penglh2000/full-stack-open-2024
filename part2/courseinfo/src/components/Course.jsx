const Header = ({ name }) => <h2>{name}</h2>

const Part = ({ part }) => {
  console.log(part)
  return (
    <p>
      {part.name} {part.exercises}
    </p>
  )
}

const Content = ({ parts }) => { 
  console.log(parts)
  return (
    <div>
      {parts.map(part => (
        <Part key={part.id} part={part} />
      ))}
    </div>
  )
}

const Total = ({ parts }) => {
  const totalExercises = parts.reduce((accumulator, part) => accumulator + part.exercises, 0);
  console.log(totalExercises)
  return (
    <p style={{ fontWeight: 'bold' }}>Total of {totalExercises} exercises</p>
  )
}

  const Course = ({ course }) => {
    return (
      <div>
        <Header name={course.name} />
        <Content parts={course.parts} />
        <Total parts={course.parts} />
      </div>
    )
  }

  export default Course