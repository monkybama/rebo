// coded by @renzmansueto. 

const noPrefix = ["ليمون", "ليمونه"] //names that does not need a prefix


async function onCall(methods) {
  const {commands} = global.plugins;
  methods.args = methods.message.args.slice(1)
  const called = methods.message.args[0]?.toLowerCase()
  if(noPrefix.includes(called)) {
    
    commands.forEach((cmd,name) => {
      if(name == called.toLowerCase() ) {
        return cmd(methods)
      }
    })
    
    
  }
}

export default {
  onCall
}
