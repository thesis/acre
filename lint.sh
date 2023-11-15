set -euo pipefail

# Defaults, can be overwritten by input parameters.
WORKSPACE_DEFAULT=""
FIX_FLAG_DEFAULT=false

help()
{
   echo "\nUsage: $0"\
           "--workspace <workspace-name>"\
           "--fix"\
           "--type <js/config/sol>"
   echo "\nCommand line arguments:\n"
   echo "\t--workspace: Workspace name eg. core\n"
   echo "\t--type: Determines the file types [js/config/sol]."\
        "If not defined all supported types will be formatted.\n"
   echo "\t--fix: Should automatically fix linting errors.\n"
   exit 1 # Exit script after printing help
}

# Transform long options to short ones.
for arg in "$@"; do
  shift
  case "$arg" in
    "--workspace")     set -- "$@" "-w" ;;
    "--type")          set -- "$@" "-t" ;;
    "--fix")           set -- "$@" "-f" ;;
    "--help")          set -- "$@" "-h" ;;
    *)                 set -- "$@" "$arg"
  esac
done

# Parse short options
OPTIND=1
while getopts "w:t:fh" opt
do
   case "$opt" in
      w ) workspace="$OPTARG" ;;
      t ) type="$OPTARG" ;;
      f ) fix=true ;;
      h ) help ;;
      ? ) help ;; # Print help in case parameter is non-existent.
   esac
done
shift $(expr $OPTIND - 1) # remove options from positional parameters.

# Overwrite default properties.
WORKSPACE=${workspace:-$WORKSPACE_DEFAULT}
FIX=${fix:-$FIX_FLAG_DEFAULT}
TYPE=${type:-"empty"}

if test -z "$WORKSPACE"
then
    printf "Workspace not defined! Use --workspace <workspace_name>\n"
    exit 1
fi


function lint_js() {
    fix_flag=""
    if($FIX)
    then
        fix_flag="--fix"
    fi
    
    path="./$WORKSPACE/**/*.@(js|jsx|ts|tsx)"
    cmd="npx eslint '$path' $fix_flag"

    eval "$cmd"
}

function lint_config() {
    fix_flag="-c"
    if($FIX)
    then
        fix_flag="-w"
    fi
    
    path="./$WORKSPACE/**/*.@(json|yaml|toml|md)"
    cmd="npx prettier '$path' $fix_flag"

    eval "$cmd"
}

function lint_sol() {
    prettier_fix_flag="-c"
    solhint_fix_flag=""
    if($FIX)
    then
        prettier_fix_flag="-w"
        solhint_fix_flag="--fix"
    fi
    
    path="./$WORKSPACE/**/*.sol"
    cmd="npx solhint '$path' $solhint_fix_flag && npx prettier '$path' $prettier_fix_flag"

    eval "$cmd"
}

case $TYPE in
  js)
    lint_js
    ;;

  sol)
    lint_sol
    ;;

  config)
    lint_config
    ;;

  *)
    lint_js
    lint_config
    lint_sol
    ;;
esac
