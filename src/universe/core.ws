(defmacro fn (args, &body)
  (cons 'fn*, (cons args body)))

(defmacro defn (
