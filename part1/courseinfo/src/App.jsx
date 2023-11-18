const Header = ({ title }) => {
  return (
    <h1>{title}</h1>
  )
}

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
      <Part part={parts[0]} />
      <Part part={parts[1]} />
      <Part part={parts[2]} />
    </div>
  )
}

const Total = ({ parts }) => {
  const totalExercises = parts[0].exercises + parts[1].exercises + parts[2].exercises
  console.log(totalExercises)
  return (
    <p>Number of exercises {totalExercises}</p>
  )
}


const App = () => {
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  return (
    <div>
      <Header title={course.name} />
      <Content parts={course.parts}/>
      <Total parts={course.parts}/>
    </div>
  )
}

export default App