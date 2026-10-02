// Exercise Library & Strength Analytics Engine
// Comprehensive exercise database with form cues, movement patterns, substitutions, and visual diagrams

export const EXERCISE_DATABASE = [
  // ─── Chest ───
  {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    muscle: 'chest',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'intermediate',
    movementPattern: 'horizontal_push',
    met: 6.0,
    instructions: {
      setup: 'Lie flat on the bench with eyes directly under the bar. Plant feet flat on the floor, grip the bar slightly wider than shoulder-width, and retract your shoulder blades.',
      movement: 'Unrack and lower the bar with control to your mid-chest (nipple line). Keep elbows at a ~45° angle. Press the bar explosively back to starting position without bouncing off your ribs.',
      breathing: 'Inhale deeply as you lower the bar; exhale forcefully as you press up past the sticking point.',
      commonMistakes: [
        'Flaring elbows out at 90 degrees (strains rotator cuff)',
        'Bouncing bar violently off the sternum',
        'Lifting glutes off the bench'
      ],
      easier: 'Dumbbell Bench Press or Flat Push-ups',
      harder: 'Pause Bench Press (2s at chest) or Incline Barbell Press'
    },
    substitutions: ['incline_bench', 'pushups', 'chest_fly', 'dips_chest']
  },
  {
    id: 'incline_bench',
    name: 'Incline Dumbbell Press',
    muscle: 'chest',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    movementPattern: 'horizontal_push',
    met: 5.5,
    instructions: {
      setup: 'Set bench to a 30°–45° incline. Sit with dumbbells resting on knees, then kick them up to shoulder level as you lie back. Keep wrists neutral.',
      movement: 'Press the dumbbells upward in a slight arc until arms are extended. Lower with control until your thumbs touch near the upper chest.',
      breathing: 'Inhale on the way down; exhale as you press upward.',
      commonMistakes: [
        'Setting the bench too steep (turns it into a shoulder press)',
        'Clinking dumbbells together at the top',
        'Arching lower back off the bench excessively'
      ],
      easier: 'Flat Dumbbell Press or Decline Push-ups',
      harder: 'Slow Tempo (3-1-1) Incline Dumbbell Press'
    },
    substitutions: ['bench_press', 'pushups', 'chest_fly']
  },
  {
    id: 'chest_fly',
    name: 'Dumbbell / Cable Chest Fly',
    muscle: 'chest',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.5,
    instructions: {
      setup: 'Lie on a flat bench holding dumbbells with palms facing each other. Maintain a slight, soft bend in the elbows.',
      movement: 'Lower weights out to the sides in a wide hugging arc until you feel a deep stretch across your chest. Squeeze your pectorals to return to the top.',
      breathing: 'Inhale as your arms open wide; exhale as you hug them together at the top.',
      commonMistakes: [
        'Bending elbows too much (turns into a press)',
        'Lowering weights past shoulder level (causes joint impingement)'
      ],
      easier: 'Machine Pec Deck or Floor Dumbbell Fly',
      harder: 'Cable Crossover with 2-second peak contraction'
    },
    substitutions: ['bench_press', 'pushups', 'incline_bench']
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    muscle: 'chest',
    category: 'strength',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    movementPattern: 'horizontal_push',
    met: 4.0,
    instructions: {
      setup: 'Start in a high plank with hands slightly wider than shoulders, core braced, glutes squeezed, and body in a rigid straight line.',
      movement: 'Lower your chest toward the floor by bending elbows back at ~45°. Descend until chest is an inch off the floor, then push through palms to return.',
      breathing: 'Inhale on the descent; exhale as you push up.',
      commonMistakes: [
        'Sagging hips or piking glutes up',
        'Looking up and hyperextending the neck',
        'Partial range of motion'
      ],
      easier: 'Knee Push-ups or Incline Push-ups against a bench/wall',
      harder: 'Decline Push-ups or Diamond Push-ups'
    },
    substitutions: ['bench_press', 'incline_bench', 'dips_chest']
  },
  {
    id: 'dips_chest',
    name: 'Parallel Bar Dips',
    muscle: 'chest',
    category: 'strength',
    equipment: 'bodyweight',
    difficulty: 'advanced',
    movementPattern: 'vertical_push',
    met: 5.5,
    instructions: {
      setup: 'Mount parallel bars with arms extended. Lean your torso slightly forward (~30°) to shift focus onto the chest rather than only triceps.',
      movement: 'Lower your body smoothly by bending elbows until upper arms are parallel to the ground (or elbows reach 90°). Push back up firmly.',
      breathing: 'Inhale on the way down; exhale as you push up.',
      commonMistakes: [
        'Staying completely upright (places all load on triceps)',
        'Dipping too deep and hyperextending shoulders'
      ],
      easier: 'Band-Assisted Dips or Bench Dips',
      harder: 'Weighted Dips with belt'
    },
    substitutions: ['bench_press', 'pushups', 'tricep_pushdown']
  },

  // ─── Back ───
  {
    id: 'deadlift',
    name: 'Barbell Deadlift',
    muscle: 'back',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'advanced',
    movementPattern: 'hip_hinge',
    met: 7.0,
    instructions: {
      setup: 'Stand with feet hip-width apart, barbell over mid-foot. Hinge at hips to grip the bar just outside knees. Engage lats and pull slack out of the bar.',
      movement: 'Drive through your heels to stand tall, keeping the bar close to your shins and thighs. Lock out with glutes without hyperextending the spine.',
      breathing: 'Take a deep breath and brace your core at the bottom; exhale at the top.',
      commonMistakes: [
        'Rounding the lower back (loss of lumbar neutral)',
        'Letting the bar drift away from shins',
        'Yanking the bar suddenly off the ground'
      ],
      easier: 'Trap Bar Deadlift or Romanian Deadlift with dumbbells',
      harder: 'Deficit Deadlift or Snatch-Grip Deadlift'
    },
    substitutions: ['romanian_deadlift', 'barbell_row', 'lat_pulldown']
  },
  {
    id: 'pullups',
    name: 'Pull-ups / Chin-ups',
    muscle: 'back',
    category: 'strength',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    movementPattern: 'vertical_pull',
    met: 6.0,
    instructions: {
      setup: 'Hang from an overhead bar with an overhand (pull-up) or underhand (chin-up) grip. Arms fully extended in an active dead hang.',
      movement: 'Pull your elbows down toward your ribs until your chin clears the bar. Squeeze back muscles at top, then lower with control.',
      breathing: 'Exhale as you pull your chest up; inhale smoothly on the descent.',
      commonMistakes: [
        'Kicking legs or swinging hips (kipping)',
        'Not lowering all the way to full arm extension'
      ],
      easier: 'Resistance Band-Assisted Pull-ups or Lat Pulldowns',
      harder: 'Weighted Pull-ups or L-Sit Pull-ups'
    },
    substitutions: ['lat_pulldown', 'seated_cable_row', 'barbell_row']
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscle: 'back',
    category: 'strength',
    equipment: 'machine',
    difficulty: 'beginner',
    movementPattern: 'vertical_pull',
    met: 5.0,
    instructions: {
      setup: 'Adjust thigh pads so your legs fit snugly. Grip the bar slightly wider than shoulder-width with palms facing away.',
      movement: 'Lean back slightly (~10°). Pull the bar down to your upper chest by driving elbows down and back. Control the return slowly.',
      breathing: 'Exhale as you pull the bar down; inhale as it extends overhead.',
      commonMistakes: [
        'Leaning back excessively and swinging your body',
        'Pulling bar behind the neck (dangerous for cervical spine)'
      ],
      easier: 'Resistance Band Pulldown',
      harder: 'Single-Arm Cable Pulldown with pause'
    },
    substitutions: ['pullups', 'seated_cable_row', 'barbell_row']
  },
  {
    id: 'barbell_row',
    name: 'Bent-Over Barbell Row',
    muscle: 'back',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'intermediate',
    movementPattern: 'horizontal_pull',
    met: 5.5,
    instructions: {
      setup: 'Hinge forward at the hips to a 45° angle with knees slightly bent. Grip the barbell slightly wider than shoulder width.',
      movement: 'Pull the bar up toward your lower abdomen, driving your elbows back and squeezing shoulder blades together. Lower under control.',
      breathing: 'Exhale as you row the bar to your stomach; inhale as you lower.',
      commonMistakes: [
        'Using momentum and jerking your torso upright',
        'Rounding the lower back'
      ],
      easier: 'Single-Arm Dumbbell Row on a bench',
      harder: 'Pendlay Row (from dead stop on floor each rep)'
    },
    substitutions: ['seated_cable_row', 'lat_pulldown', 'pullups']
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row',
    muscle: 'back',
    category: 'strength',
    equipment: 'cables',
    difficulty: 'beginner',
    movementPattern: 'horizontal_pull',
    met: 4.5,
    instructions: {
      setup: 'Sit with feet on footrests, knees slightly bent. Grasp the V-bar attachment with an upright neutral spine.',
      movement: 'Pull the handle toward your navel while keeping chest tall. Squeeze your lats and mid-back at the peak, then extend arms slowly.',
      breathing: 'Exhale as you pull the cable inward; inhale as you extend arms.',
      commonMistakes: [
        'Rounding upper back when releasing weight',
        'Swinging torso forward and backward'
      ],
      easier: 'Resistance Band Seated Row',
      harder: 'Wide Grip Cable Row with 3-second eccentric'
    },
    substitutions: ['barbell_row', 'lat_pulldown', 'pullups']
  },

  // ─── Legs ───
  {
    id: 'barbell_squat',
    name: 'Barbell Back Squat',
    muscle: 'legs',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'advanced',
    movementPattern: 'squat',
    met: 7.0,
    instructions: {
      setup: 'Rest the barbell across your upper traps. Stand with feet slightly wider than shoulder-width, toes angled slightly outward (~15°–30°).',
      movement: 'Brace your core, sit hips down and back as if sitting into a chair. Descend until thighs are at least parallel to the floor, then drive through mid-foot to stand.',
      breathing: 'Inhale deeply and hold intra-abdominal pressure during descent; exhale as you pass the sticking point on the way up.',
      commonMistakes: [
        'Knees caving inward (valgus collapse)',
        'Heels rising off the floor',
        'Rounding lower back at the bottom (butt wink)'
      ],
      easier: 'Goblet Squat with dumbbell or Bodyweight Air Squats',
      harder: 'Front Squats or Pause Squats (3s pause at parallel)'
    },
    substitutions: ['leg_press', 'lunges', 'romanian_deadlift']
  },
  {
    id: 'goblet_squat',
    name: 'Dumbbell Goblet Squat',
    muscle: 'legs',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'squat',
    met: 5.5,
    instructions: {
      setup: 'Hold a dumbbell vertically against your chest with both hands cradling the top weight plate. Stand with feet shoulder-width apart.',
      movement: 'Bend knees and push hips back to squat down between your legs until elbows touch inside your knees. Drive through feet to stand tall.',
      breathing: 'Inhale as you lower; exhale as you push back up to standing.',
      commonMistakes: [
        'Holding the dumbbell away from your chest (strains upper back)',
        'Letting heels lift off the ground'
      ],
      easier: 'Bodyweight Box Squats',
      harder: 'Barbell Back Squat or Bulgarian Split Squats'
    },
    substitutions: ['barbell_squat', 'leg_press', 'lunges']
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscle: 'legs',
    category: 'strength',
    equipment: 'machine',
    difficulty: 'beginner',
    movementPattern: 'squat',
    met: 5.5,
    instructions: {
      setup: 'Sit firmly in the leg press seat with back and hips pressed against the pad. Place feet flat on the sled, shoulder-width apart.',
      movement: 'Release the safety handles. Bend your knees to lower the sled until knees reach a 90° angle. Press smoothly through your feet without locking knees at the top.',
      breathing: 'Inhale as the platform lowers; exhale as you press it away.',
      commonMistakes: [
        'Locking knees aggressively at the top',
        'Lifting lower back/tailbone off the seat pad'
      ],
      easier: 'Lighter Weight Leg Press or Bodyweight Squat',
      harder: 'Single-Leg Press'
    },
    substitutions: ['barbell_squat', 'goblet_squat', 'lunges']
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'legs',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    movementPattern: 'hip_hinge',
    met: 6.0,
    instructions: {
      setup: 'Hold dumbbells or barbell in front of thighs with feet hip-width apart and knees soft (slightly bent, never locked).',
      movement: 'Push hips backward as you lower the weights along your shins, keeping spine flat. Stop when you feel a deep hamstring stretch, then thrust hips forward.',
      breathing: 'Inhale on the hinge down; exhale as you stand up and squeeze glutes.',
      commonMistakes: [
        'Squatting instead of hip hinging (bending knees too much)',
        'Allowing the lower back to curve'
      ],
      easier: 'Glute Bridges or Bodyweight Good Mornings',
      harder: 'Single-Leg Romanian Deadlift with dumbbells'
    },
    substitutions: ['deadlift', 'leg_curl', 'barbell_squat']
  },
  {
    id: 'lunges',
    name: 'Walking Dumbbell Lunges',
    muscle: 'legs',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    movementPattern: 'lunge',
    met: 5.0,
    instructions: {
      setup: 'Stand tall holding dumbbells at your sides. Maintain an upright torso and braced core.',
      movement: 'Take a large step forward and bend both knees to 90°, lowering your back knee until it hovers an inch above the floor. Push through front heel to step forward into the next lunge.',
      breathing: 'Inhale as you step and drop into the lunge; exhale as you push back up.',
      commonMistakes: [
        'Front knee pushing excessively past toes',
        'Torso collapsing forward'
      ],
      easier: 'Static Stationary Lunges or Bodyweight Reverse Lunges',
      harder: 'Bulgarian Split Squats with elevated rear foot'
    },
    substitutions: ['barbell_squat', 'goblet_squat', 'leg_press']
  },
  {
    id: 'leg_extension',
    name: 'Leg Extension',
    muscle: 'legs',
    category: 'strength',
    equipment: 'machine',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.0,
    instructions: {
      setup: 'Sit with back against pad and shin pad resting just above ankles. Align knee joints with the machine pivot point.',
      movement: 'Extend legs forward and upward until knees are straight, squeezing quadriceps at the top. Lower the pad with control.',
      breathing: 'Exhale as you extend legs; inhale as you lower the weight.',
      commonMistakes: ['Kicking the weight up with jerky momentum'],
      easier: 'Lighter Weight Leg Extension',
      harder: 'Single-Leg Extension with 2-second hold'
    },
    substitutions: ['barbell_squat', 'goblet_squat', 'leg_press']
  },
  {
    id: 'leg_curl',
    name: 'Hamstring Leg Curl',
    muscle: 'legs',
    category: 'strength',
    equipment: 'machine',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.0,
    instructions: {
      setup: 'Lie face down (or sit if using seated machine) with the lever pad against lower calves.',
      movement: 'Curl heels toward your glutes by flexing the hamstrings. Hold briefly at peak contraction, then lower slowly.',
      breathing: 'Exhale as you curl heels in; inhale as you extend legs.',
      commonMistakes: ['Lifting hips off the bench during the curl'],
      easier: 'Stability Ball Hamstring Curl',
      harder: 'Nordic Hamstring Curl'
    },
    substitutions: ['romanian_deadlift', 'deadlift']
  },
  {
    id: 'calf_raises',
    name: 'Standing Calf Raise',
    muscle: 'legs',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 3.5,
    instructions: {
      setup: 'Stand on the edge of a step with balls of feet, holding dumbbells or resting a barbell across traps.',
      movement: 'Lower heels below step level for a deep stretch, then press high onto the balls of your feet, squeezing calves hard at the top.',
      breathing: 'Exhale as you rise up onto toes; inhale as you lower heels.',
      commonMistakes: ['Bouncing rapidly without pausing at the top and bottom'],
      easier: 'Flat Ground Calf Raises',
      harder: 'Single-Leg Standing Calf Raise'
    },
    substitutions: ['goblet_squat', 'lunges']
  },

  // ─── Shoulders ───
  {
    id: 'overhead_press',
    name: 'Overhead Barbell Press (OHP)',
    muscle: 'shoulders',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'advanced',
    movementPattern: 'vertical_push',
    met: 5.5,
    instructions: {
      setup: 'Stand with feet shoulder-width apart. Rest bar on front deltoids with hands just outside shoulders. Squeeze glutes and core.',
      movement: 'Press the bar vertically overhead in a straight path, moving your head slightly back to clear the chin. Lock out with arms overhead.',
      breathing: 'Take a deep breath at the collarbones; exhale as the bar reaches full overhead extension.',
      commonMistakes: [
        'Excessively arching lower back to compensate',
        'Pressing the bar forward instead of straight overhead'
      ],
      easier: 'Seated Dumbbell Shoulder Press',
      harder: 'Push Press or Z-Press (seated on floor with legs straight)'
    },
    substitutions: ['dumbbell_shoulder_press', 'lateral_raise', 'pushups']
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Dumbbell Shoulder Press',
    muscle: 'shoulders',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'vertical_push',
    met: 5.0,
    instructions: {
      setup: 'Sit on a bench with back support, holding dumbbells at ear level with palms facing forward.',
      movement: 'Press dumbbells straight upward until arms are fully extended overhead. Lower slowly back to ear level.',
      breathing: 'Exhale as you press upward; inhale on the descent.',
      commonMistakes: [
        'Flaring elbows completely to the sides (keep them angled slightly forward ~30°)',
        'Arching lower back off the pad'
      ],
      easier: 'Seated Arnold Press or Resistance Band Shoulder Press',
      harder: 'Standing Dumbbell Overhead Press'
    },
    substitutions: ['overhead_press', 'lateral_raise', 'pushups']
  },
  {
    id: 'lateral_raise',
    name: 'Dumbbell Lateral Raise',
    muscle: 'shoulders',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 3.8,
    instructions: {
      setup: 'Stand tall with dumbbells hanging at your sides, palms facing inward and elbows slightly soft.',
      movement: 'Raise dumbbells out to the sides until arms are parallel to the ground (shoulder height), leading with elbows. Lower with control.',
      breathing: 'Exhale as you raise the dumbbells; inhale on the way down.',
      commonMistakes: [
        'Swinging torso and using momentum',
        'Lifting weights higher than shoulders'
      ],
      easier: 'Resistance Band Lateral Raise',
      harder: 'Cable Lateral Raise with 2-second hold at the top'
    },
    substitutions: ['dumbbell_shoulder_press', 'overhead_press', 'face_pull']
  },
  {
    id: 'face_pull',
    name: 'Cable Face Pull',
    muscle: 'shoulders',
    category: 'strength',
    equipment: 'cables',
    difficulty: 'beginner',
    movementPattern: 'horizontal_pull',
    met: 4.0,
    instructions: {
      setup: 'Attach rope to a high cable pulley. Grasp ends with thumbs pointing back toward yourself.',
      movement: 'Step back to create tension. Pull the rope toward your face, separating the ends and externally rotating your shoulders so knuckles point back.',
      breathing: 'Exhale as you pull the rope toward your face; inhale as you return.',
      commonMistakes: [
        'Pulling with elbows dropped low',
        'Arching lower back to move the weight'
      ],
      easier: 'Band Pull-Apart',
      harder: 'Heavy Cable Face Pull with 3s hold'
    },
    substitutions: ['reverse_fly', 'seated_cable_row', 'lateral_raise']
  },
  {
    id: 'reverse_fly',
    name: 'Rear Delt Fly',
    muscle: 'shoulders',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 3.8,
    instructions: {
      setup: 'Hinge forward at the hips with flat back. Hold dumbbells hanging beneath your chest with palms facing each other.',
      movement: 'Raise arms out to the sides in a reverse hugging motion, focusing on squeezing the back of your shoulders. Lower slowly.',
      breathing: 'Exhale as you raise arms; inhale as you lower.',
      commonMistakes: ['Shrugging traps instead of using rear delts'],
      easier: 'Machine Rear Delt Fly (Reverse Pec Deck)',
      harder: 'Incline Bench Chest-Supported Rear Delt Fly'
    },
    substitutions: ['face_pull', 'seated_cable_row']
  },

  // ─── Arms ───
  {
    id: 'barbell_curl',
    name: 'Barbell Bicep Curl',
    muscle: 'arms',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.0,
    instructions: {
      setup: 'Stand tall holding a barbell with underhand grip at shoulder-width. Elbows pinned close to your torso.',
      movement: 'Curl the bar up toward your shoulders by flexing biceps. Squeeze at the top, then lower with a strict 2-second negative.',
      breathing: 'Exhale as you curl the weight; inhale as you lower it.',
      commonMistakes: [
        'Swinging your back to heave the bar up',
        'Letting elbows drift forward excessively'
      ],
      easier: 'Dumbbell Bicep Curl',
      harder: 'Preacher Curl or 21s Bicep Routine'
    },
    substitutions: ['hammer_curl', 'pullups']
  },
  {
    id: 'hammer_curl',
    name: 'Dumbbell Hammer Curl',
    muscle: 'arms',
    category: 'strength',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.0,
    instructions: {
      setup: 'Stand holding dumbbells with neutral grip (palms facing each other), arms hanging naturally.',
      movement: 'Curl weights up toward shoulders while keeping palms facing inward throughout the movement. Squeeze forearms and brachialis at the top.',
      breathing: 'Exhale on the curl; inhale on the lowering phase.',
      commonMistakes: ['Using momentum from hips to start the curl'],
      easier: 'Alternating Single-Arm Hammer Curl',
      harder: 'Incline Bench Hammer Curl'
    },
    substitutions: ['barbell_curl', 'pullups']
  },
  {
    id: 'tricep_pushdown',
    name: 'Tricep Rope Pushdown',
    muscle: 'arms',
    category: 'strength',
    equipment: 'cables',
    difficulty: 'beginner',
    movementPattern: 'isolation',
    met: 4.0,
    instructions: {
      setup: 'Stand facing cable with rope attachment at chest height. Keep elbows tucked against your ribcage.',
      movement: 'Push the rope down until arms are fully straight, spreading the rope ends apart at the bottom to maximize tricep contraction. Return slowly.',
      breathing: 'Exhale as you push down; inhale as hands return to chest level.',
      commonMistakes: [
        'Allowing elbows to flare forward and back',
        'Using whole body weight to press the cable'
      ],
      easier: 'Resistance Band Pushdown',
      harder: 'Single-Arm Cable Tricep Extension'
    },
    substitutions: ['skull_crushers', 'dips_chest', 'pushups']
  },
  {
    id: 'skull_crushers',
    name: 'EZ Bar Skull Crushers',
    muscle: 'arms',
    category: 'strength',
    equipment: 'barbell',
    difficulty: 'intermediate',
    movementPattern: 'isolation',
    met: 4.5,
    instructions: {
      setup: 'Lie on a flat bench holding an EZ bar or dumbbells with arms extended straight over your chest.',
      movement: 'Keeping upper arms stationary and vertical, bend elbows to lower the bar toward your forehead or crown of your head. Extend elbows back to start.',
      breathing: 'Inhale as bar lowers; exhale as you extend elbows.',
      commonMistakes: [
        'Flaring elbows out wide',
        'Moving upper arms back and forth like a pullover'
      ],
      easier: 'Overhead Dumbbell Tricep Extension (seated)',
      harder: 'Incline Bench Skull Crushers'
    },
    substitutions: ['tricep_pushdown', 'dips_chest']
  },

  // ─── Core ───
  {
    id: 'plank',
    name: 'Plank',
    muscle: 'core',
    category: 'strength',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    movementPattern: 'core_hold',
    met: 3.5,
    instructions: {
      setup: 'Lie prone, then prop yourself up on forearms and toes. Elbows directly beneath shoulders. Squeeze glutes and pull navel to spine.',
      movement: 'Hold a perfectly rigid, straight line from head to heels. Do not let hips drop or hike into the air.',
      breathing: 'Breathe steadily and diaphragmatically throughout the hold.',
      commonMistakes: [
        'Sagging lower back (lumbar hyperextension)',
        'Holding breath'
      ],
      easier: 'Knee Plank or Incline Forearm Plank',
      harder: 'Side Plank with leg lift or Plank with shoulder taps'
    },
    substitutions: ['hanging_leg_raise', 'cable_crunch']
  },
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg Raise',
    muscle: 'core',
    category: 'strength',
    equipment: 'bodyweight',
    difficulty: 'advanced',
    movementPattern: 'core_flexion',
    met: 4.5,
    instructions: {
      setup: 'Hang from a pull-up bar with overhand grip and legs straight.',
      movement: 'Without swinging, curl your pelvis upward and lift legs forward until parallel to the ground (or touch the bar for toes-to-bar). Lower slowly.',
      breathing: 'Exhale as you raise your legs; inhale as you lower them.',
      commonMistakes: ['Using swinging momentum rather than abs'],
      easier: 'Hanging Knee Raises or Captain\'s Chair Knee Raise',
      harder: 'Toes-To-Bar or Windshield Wipers'
    },
    substitutions: ['plank', 'cable_crunch']
  },
  {
    id: 'cable_crunch',
    name: 'Cable Rope Kneeling Crunch',
    muscle: 'core',
    category: 'strength',
    equipment: 'cables',
    difficulty: 'beginner',
    movementPattern: 'core_flexion',
    met: 4.0,
    instructions: {
      setup: 'Kneel beneath a high cable pulley holding rope attachment beside your temples. Hips remain high and stationary.',
      movement: 'Flex spine to curl your ribcage down toward your pelvis, squeezing abs hard. Return smoothly without sitting back onto your calves.',
      breathing: 'Exhale completely as you curl downward; inhale on return.',
      commonMistakes: ['Moving through the hips rather than flexing the spine'],
      easier: 'Floor Crunch with legs elevated',
      harder: 'Weighted Ab Wheel Rollouts'
    },
    substitutions: ['plank', 'hanging_leg_raise']
  },

  // ─── Cardio & Conditioning ───
  {
    id: 'treadmill_run',
    name: 'Running / Treadmill',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'intermediate',
    movementPattern: 'cardio',
    met: 9.8,
    instructions: {
      setup: 'Set treadmill to comfortable warm-up pace with a 1.0% incline to simulate outdoor resistance.',
      movement: 'Maintain tall upright posture, light forward lean from ankles, midfoot strike, and relaxed shoulders with arms swinging front-to-back.',
      breathing: 'Rhythmic 2-in, 2-out breathing pattern.',
      commonMistakes: ['Over-striding and landing heavy on heels', 'Gripping treadmill handrails'],
      easier: 'Brisk Incline Walking',
      harder: 'Treadmill Hill Sprints or HIIT Intervals'
    },
    substitutions: ['cycling', 'rowing', 'jump_rope', 'outdoor_walk']
  },
  {
    id: 'cycling',
    name: 'Cycling / Spin Bike',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'beginner',
    movementPattern: 'cardio',
    met: 7.5,
    instructions: {
      setup: 'Adjust saddle height so knee has a slight bend (~25°–30°) at the bottom of the pedal stroke. Align handlebars comfortably.',
      movement: 'Pedal in smooth circular strokes, pushing through balls of feet and pulling up. Maintain cadences of 80–100 RPM for aerobic conditioning.',
      breathing: 'Steady deep breaths matching your cadence.',
      commonMistakes: ['Saddle too low (causes anterior knee strain)'],
      easier: 'Low-Resistance Recumbent Bike',
      harder: 'High-Resistance Tabata Spin Sprints'
    },
    substitutions: ['treadmill_run', 'rowing', 'outdoor_walk']
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    movementPattern: 'cardio',
    met: 11.0,
    instructions: {
      setup: 'Hold handles at hip height with elbows tucked close to ribcage. Rope rests behind heels.',
      movement: 'Turn rope with wrists rather than shoulders. Jump only 1 to 2 inches off the ground on the balls of your feet with soft knees.',
      breathing: 'Relaxed, rhythmic breathing.',
      commonMistakes: ['Jumping too high and landing heavy on flat feet'],
      easier: 'Low Impact Shadow Jumping',
      harder: 'Double Unders (rope passes twice per jump)'
    },
    substitutions: ['treadmill_run', 'cycling', 'hiit']
  },
  {
    id: 'rowing',
    name: 'Rowing Machine',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'cardio_machine',
    difficulty: 'intermediate',
    movementPattern: 'cardio',
    met: 7.0,
    instructions: {
      setup: 'Strap feet firmly into footplates. Grab handle with relaxed overhand grip, arms straight and shins vertical.',
      movement: 'Sequence: Legs -> Torso -> Arms. Drive through legs, swing torso back to 11 o\'clock, pull handle to lower ribs. Reverse smoothly: Arms -> Torso -> Legs.',
      breathing: 'Exhale on the drive back; inhale on the slide forward.',
      commonMistakes: [
        'Bending knees before arms have cleared them on return',
        'Pulling with arms before legs have driven'
      ],
      easier: 'Steady Zone 2 Rowing',
      harder: '500m All-Out Sprints'
    },
    substitutions: ['treadmill_run', 'cycling', 'swimming']
  },
  {
    id: 'hiit',
    name: 'HIIT Circuit',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    movementPattern: 'cardio',
    met: 8.5,
    instructions: {
      setup: 'Clear a 6x6 foot open space. Wear supportive athletic shoes.',
      movement: 'Perform 40 seconds of high-intensity calisthenics (jumping jacks, high knees, mountain climbers, burpees) followed by 20 seconds of rest.',
      breathing: 'Focus on recovery breathing during the 20-second rest windows.',
      commonMistakes: ['Sacrificing movement quality and form for speed'],
      easier: 'Low-Impact Cardio Circuit (step jacks, marches)',
      harder: 'Tabata 20s Max Effort / 10s Rest'
    },
    substitutions: ['jump_rope', 'cycling', 'treadmill_run']
  },
  {
    id: 'outdoor_walk',
    name: 'Brisk Walking / Active Recovery',
    muscle: 'cardio',
    category: 'cardio',
    equipment: 'none',
    difficulty: 'beginner',
    movementPattern: 'cardio',
    met: 4.0,
    instructions: {
      setup: 'Comfortable walking shoes, outdoor park/treadmill path.',
      movement: 'Walk at a purposeful brisk pace (approx 5 to 6 km/h) with natural arm swing and upright posture.',
      breathing: 'Natural nasal or relaxed breathing.',
      commonMistakes: ['Slouching or looking down at phone continuously'],
      easier: 'Casual Stroll',
      harder: 'Ruck Walking (wearing 10–15kg weighted backpack)'
    },
    substitutions: ['cycling', 'treadmill_run']
  }
];

// ─── Search & Lookup ───
export function searchExercises(query) {
  if (!query) return EXERCISE_DATABASE;
  const q = query.toLowerCase();
  return EXERCISE_DATABASE.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.muscle.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    (e.equipment && e.equipment.toLowerCase().includes(q))
  );
}

export function getExerciseById(id) {
  return EXERCISE_DATABASE.find(e => e.id === id) || null;
}

// ─── 1RM Calculation (Epley formula: 1RM = weight * (1 + reps / 30)) ───
export function calculate1RM(weightKg, reps) {
  if (!weightKg || !reps || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

// ─── Total Volume Calculation ───
export function calculateWorkoutVolume(exercises) {
  if (!exercises || !Array.isArray(exercises)) return 0;
  let totalVol = 0;
  for (const ex of exercises) {
    if (ex.sets && Array.isArray(ex.sets)) {
      for (const set of ex.sets) {
        if (set && set.completed !== false) {
          const wt = Number(set.weight) || 0;
          const reps = Number(set.reps) || 0;
          totalVol += wt * reps;
        }
      }
    }
  }
  return Math.round(totalVol);
}

// ─── Estimate Calories Burned ───
export function estimateCaloriesBurned(exerciseId, durationMinutes, userWeightKg = 70) {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId) || { met: 5.0 };
  const hours = (durationMinutes || 0) / 60;
  return Math.round(ex.met * userWeightKg * hours);
}

// ─── Personalized Workout Generator Presets ───
const WORKOUT_GOAL_PRESETS = {
  lose: {
    label: 'Fat Loss',
    muscleOrder: ['legs', 'back', 'chest', 'shoulders', 'core', 'arms'],
    reps: 15,
    restSec: 45,
    includeCardio: true,
    warmup: ['5 min brisk walk or jump rope', 'Dynamic leg swings (front/back + lateral)', 'Bodyweight hip hinges', 'Arm circles + band pull-aparts'],
    cooldown: ['5 min easy walk to lower heart rate', 'Standing quad + hamstring stretch', 'Doorway chest stretch', 'Box breathing 4-4-4-4']
  },
  gain: {
    label: 'Hypertrophy',
    muscleOrder: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
    reps: 10,
    restSec: 90,
    includeCardio: false,
    warmup: ['5 min light cycle or rowing', 'Scapular push-ups (2 × 15)', 'Bodyweight squats (2 × 15)', 'Empty-bar or light-weight set of each first movement'],
    cooldown: ['3 min slow walk', 'Pectoral doorway stretch', 'Lat stretch on rack', 'Diaphragmatic breathing 5 min'],
    setBonus: 0
  },
  strength: {
    label: 'Strength',
    muscleOrder: ['back', 'legs', 'chest', 'shoulders', 'core', 'arms'],
    reps: 5,
    restSec: 150,
    includeCardio: false,
    warmup: ['8 min ramp-up on bike or rower', 'Dynamic mobility: hips, ankles, thoracic spine', 'Empty-bar practice sets (2 × 5)', '2–3 ramp sets on the first compound lift'],
    cooldown: ['4 min easy walk', 'Legs-up-the-wall 90 seconds', 'Lat + pec stretches', 'Slow nasal breathing to drop blood pressure']
  },
  endurance: {
    label: 'Endurance',
    muscleOrder: ['cardio', 'core', 'legs', 'back', 'chest', 'shoulders'],
    reps: 20,
    restSec: 30,
    includeCardio: true,
    warmup: ['8 min progressive warm-up walk', 'Leg swings + hip circles', 'Bodyweight squat pulses', 'Easy 3 min build into pace'],
    cooldown: ['8 min cool-down walk or slow cycle', 'Full-body static stretch', 'Foam roll quads, hamstrings, calves', 'Hydrate and log your session']
  }
};

const EQUIPMENT_LABELS = {
  dumbbells: 'Dumbbells & Bench',
  bodyweight: 'Bodyweight Calisthenics',
  gym: 'Full Gym'
};

// Baseline working loads (kg) per equipment type, scaled by experience level
const EQUIPMENT_BASE_LOAD = {
  barbell: 40,
  dumbbells: 15,
  machine: 25,
  cables: 20,
  cardio_machine: 0,
  bodyweight: 0,
  none: 0
};

function suggestLoadKg(exercise, experience) {
  const base = EQUIPMENT_BASE_LOAD[exercise.equipment];
  if (!base) return 0;
  const mult = experience === 'beginner' ? 0.5 : experience === 'advanced' ? 1.5 : 1;
  return Math.max(2, Math.round((base * mult) / 2) * 2);
}

// ─── Personalized Workout Generator (goal · equipment · duration · experience) ───
/**
 * Builds a structured session: warm-up, targeted working sets and a cooldown.
 * Deterministic per option set, so the same inputs always yield the same plan.
 */
export function generatePersonalizedWorkout({
  goal = 'lose',
  equipment = 'dumbbells',
  duration = 45,
  experience = 'intermediate',
  userWeightKg = 70
} = {}) {
  const dur = Number(duration) > 0 ? Number(duration) : 45;
  const preset = WORKOUT_GOAL_PRESETS[goal] || WORKOUT_GOAL_PRESETS.lose;
  const level = ['beginner', 'intermediate', 'advanced'].includes(experience) ? experience : 'intermediate';
  const equipKey = ['bodyweight', 'dumbbells', 'gym'].includes(equipment) ? equipment : 'gym';

  // 1. Build the available exercise pool for the selected equipment
  let pool = EXERCISE_DATABASE;
  if (equipKey === 'bodyweight') {
    pool = pool.filter(e => e.equipment === 'bodyweight' || e.equipment === 'none');
  } else if (equipKey === 'dumbbells') {
    pool = pool.filter(e => e.equipment === 'dumbbells' || e.equipment === 'bodyweight' || e.equipment === 'none');
  }
  if (!preset.includeCardio) {
    pool = pool.filter(e => e.category !== 'cardio');
  }
  if (pool.length === 0) pool = EXERCISE_DATABASE;

  // 2. Session length determines how many movements we can fit in
  const targetCount = dur <= 30 ? 5 : dur <= 45 ? 6 : 7;
  const selected = [];

  // Prioritise compound movements matching the goal's emphasis order
  for (const muscle of preset.muscleOrder) {
    if (selected.length >= targetCount) break;
    const match = pool.find(e => e.muscle === muscle && !selected.some(s => s.id === e.id));
    if (match) selected.push(match);
  }

  // Top up with any remaining pool exercises if the emphasis order came up short
  for (const e of pool) {
    if (selected.length >= targetCount) break;
    if (!selected.some(s => s.id === e.id)) selected.push(e);
  }

  if (selected.length === 0) {
    return {
      title: `${preset.label} Recovery Session`,
      duration: dur,
      caloriesBurned: 0,
      warmup: preset.warmup,
      cooldown: preset.cooldown,
      exercises: []
    };
  }

  // 3. Prescribe sets, reps, load and rest per exercise
  const baseSets = level === 'beginner' ? 3 : level === 'advanced' ? 5 : 4;
  const isCardioFinisher = preset.includeCardio && selected.some(e => e.category === 'cardio');

  const exercises = selected.map((ex, index) => {
    const timeBased = ex.category === 'cardio';
    const setCount = timeBased ? Math.max(2, baseSets - 1) : baseSets;
    const reps = timeBased ? 60 : preset.reps;
    const weight = suggestLoadKg(ex, level);
    const restSec = timeBased ? 30 : preset.restSec;

    const sets = [];
    for (let i = 0; i < setCount; i++) {
      // Progressive overload: later sets carry a small load increase when load is applicable
      let setWeight = weight;
      if (!timeBased && weight > 0) {
        setWeight = weight + (level === 'beginner' ? 0 : Math.round((i * weight * 0.05) / 2) * 2);
      }
      sets.push({ weight: setWeight, reps, restSec, completed: false });
    }

    return {
      exerciseId: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      equipment: ex.equipment,
      order: index + 1,
      timeBased,
      sets
    };
  });

  // 4. Estimate energy expenditure across the working portion of the session
  const workingMinutes = dur * 0.75;
  const perExerciseMinutes = workingMinutes / exercises.length;
  const weight = Number(userWeightKg) > 0 ? Number(userWeightKg) : 70;
  const caloriesBurned = exercises.reduce(
    (sum, e) => sum + estimateCaloriesBurned(e.exerciseId, perExerciseMinutes, weight),
    0
  );

  return {
    title: `${preset.label} · ${EQUIPMENT_LABELS[equipKey]} · ${dur} Min`,
    duration: dur,
    caloriesBurned: Math.round(caloriesBurned),
    warmup: preset.warmup,
    cooldown: preset.cooldown,
    isCardioFinisher,
    exercises
  };
}

// ─── Exercise Visual Generator (SVG Vector Anatomical Illustration) ───
export function renderExerciseVisualSvg(exerciseId, isHighlighted = false) {
  const ex = getExerciseById(exerciseId);
  const muscle = ex?.muscle || 'chest';
  const color = muscle === 'chest' ? '#3b82f6'
    : muscle === 'back' ? '#8b5cf6'
    : muscle === 'legs' ? '#10b981'
    : muscle === 'shoulders' ? '#f59e0b'
    : muscle === 'arms' ? '#ec4899'
    : muscle === 'core' ? '#06b6d4'
    : '#f97316';

  return `
    <div class="exercise-visual-frame" style="border-color:${color}40">
      <div class="visual-badge" style="background:${color}20;color:${color}">${(ex?.category || 'Strength').toUpperCase()}</div>
      <div class="visual-svg-wrap">
        <svg viewBox="0 0 200 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${exerciseId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${color}" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.9"/>
            </linearGradient>
            <filter id="glow-${exerciseId}">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Bench / Floor / Apparatus Line -->
          <line x1="20" y1="120" x2="180" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="3" stroke-dasharray="4"/>

          <!-- Stylized Human Figure -->
          <circle cx="100" cy="35" r="14" fill="#ffffff" opacity="0.9" />
          
          <!-- Torso -->
          <path d="M 100,50 L 100,85" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
          
          <!-- Highlighted Target Muscle Group Overlay -->
          ${muscle === 'chest' ? `
            <ellipse cx="100" cy="60" rx="14" ry="8" fill="url(#grad-${exerciseId})" filter="url(#glow-${exerciseId})"/>
            <!-- Barbell or Dumbbells -->
            <line x1="60" y1="52" x2="140" y2="52" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
            <rect x="55" y="44" width="6" height="16" rx="2" fill="#fbbf24"/>
            <rect x="139" y="44" width="6" height="16" rx="2" fill="#fbbf24"/>
          ` : muscle === 'back' ? `
            <path d="M 88,55 Q 100,68 112,55" fill="none" stroke="url(#grad-${exerciseId})" stroke-width="10" filter="url(#glow-${exerciseId})"/>
            <!-- Pull-up bar overhead -->
            <line x1="50" y1="15" x2="150" y2="15" stroke="#94a3b8" stroke-width="4"/>
          ` : muscle === 'legs' ? `
            <!-- Legs highlighted -->
            <path d="M 100,85 L 85,115 L 80,120 M 100,85 L 115,115 L 120,120" stroke="url(#grad-${exerciseId})" stroke-width="8" stroke-linecap="round" filter="url(#glow-${exerciseId})"/>
          ` : muscle === 'shoulders' ? `
            <!-- Shoulders highlighted -->
            <ellipse cx="100" cy="52" rx="18" ry="6" fill="url(#grad-${exerciseId})" filter="url(#glow-${exerciseId})"/>
            <!-- Overhead Dumbbells -->
            <line x1="75" y1="25" x2="75" y2="40" stroke="#f59e0b" stroke-width="4"/>
            <line x1="125" y1="25" x2="125" y2="40" stroke="#f59e0b" stroke-width="4"/>
          ` : muscle === 'arms' ? `
            <!-- Biceps / Arms highlighted -->
            <path d="M 100,55 L 75,70 L 80,50 M 100,55 L 125,70 L 120,50" stroke="url(#grad-${exerciseId})" stroke-width="6" stroke-linecap="round" filter="url(#glow-${exerciseId})"/>
          ` : `
            <!-- Core / Cardio / Generic -->
            <ellipse cx="100" cy="72" rx="10" ry="12" fill="url(#grad-${exerciseId})" filter="url(#glow-${exerciseId})"/>
          `}

          <!-- Arms / Legs Default Structure -->
          ${muscle !== 'legs' ? `<path d="M 100,85 L 88,118 M 100,85 L 112,118" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>` : ''}
          ${muscle !== 'arms' && muscle !== 'chest' && muscle !== 'shoulders' ? `<path d="M 100,55 L 80,80 M 100,55 L 120,80" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.5"/>` : ''}

          <!-- Motion Arrows -->
          <path d="M 40,70 Q 40,55 50,45" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3" opacity="0.7"/>
          <polygon points="50,42 53,48 47,48" fill="${color}" opacity="0.7"/>
        </svg>
      </div>
      <div class="visual-footer">
        <span class="visual-muscle-pill" style="color:${color}">${(ex?.muscle || 'General').toUpperCase()}</span>
        <span class="visual-pattern-pill">${(ex?.movementPattern || 'Functional').replace('_', ' ').toUpperCase()}</span>
      </div>
    </div>
  `;
}
